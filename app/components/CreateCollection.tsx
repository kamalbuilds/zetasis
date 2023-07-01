import {
  HStack,
  VStack,
  Text,
  Input,
  Button,
  Box,
  Image,
  Switch,
  Spinner,
  Divider,
  Link as ChakraLink,
  useDisclosure,
  Highlight,
  Checkbox,
} from "@chakra-ui/react";
import axios from "axios";
import styles from "../styles/Create.module.css";
import { useCallback, useState } from "react";
import SuccessLottie from "@components/SuccessLottie";
import { useAccount, useSigner, useSwitchNetwork } from "wagmi";
import NewNFT from "@data/NewNFT.json";
import Link from "next/link";
import { BigNumber, ethers } from "ethers";
import { CollectionMetadata } from "@utils/types";
import { client } from "@utils/web3";
import { CheckIcon, InfoIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const categoryOptions = ["Goerli", "Polygon Mumbai"];

export default function CreateCollection() {
  const { address } = useAccount();
  const [isCategoriesVisible, setCategoriesVisible] = useState<boolean>();
  const [uploadedImage, setUploadedImage] = useState<any>();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [publishedContract, setPublishedContract] = useState<string>("");
  const { data: signer, isError } = useSigner();

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [collectionId, setCollectionId] = useState<string>("");
  const [externalURL, setExternalURL] = useState<string>("");
  const [baseURI, setBaseURI] = useState<string>("");
  const [tokenSupply, setTokenSupply] = useState<number>(10000);
  const [symbol, setSymbol] = useState<string>("");
  const [royalties, setRoyalties] = useState<BigNumber>(BigNumber.from(5));
  const [txnHash, setTxnHash] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<any>({});
  const [step, setStep] = useState(1);
  const [collectionURI, setCollectionURI] = useState<string>("");
  const [isViewSuccessPage, setViewSuccessPage] = useState<boolean>(false);
  const [goerliContractAddress, setGoerliContractAddress] =
    useState<string>("");
  const [polygonContractAddress, setPolygonContractAddress] =
    useState<string>("");
  const [loading, setLoading] = useState([false, false, false, false]);

  const incrementStep = () => {
    if (step < 4) setStep((prevStep) => prevStep + 1);
  };

  const steps = [
    {
      title: "Deploy collection to Goerli",
      button: "Deploy",
      onClick: deployGoerli,
    },
    {
      title: "Deploy collection to Mumbai",
      button: "Deploy",
      onClick: deployPolygon,
    },
    {
      title: "Setup connector on Mumbai",
      button: "Setup",
      onClick: setupConnectorPolygon,
    },
    {
      title: "Setup connector on Goerli",
      button: "Setup",
      onClick: setupConnectorGoerli,
    },
  ];

  const {
    chains,
    error,
    isLoading: isNetworkLoading,
    switchNetwork,
  } = useSwitchNetwork();

  function handleImageUpload(e) {
    setUploadedImage(e.target.files[0]);
  }

  function handleNameChange(e) {
    setName(e.target.value);
  }

  function handleDescriptionChange(e) {
    setDescription(e.target.value);
  }

  function handleBaseURIChange(e) {
    setBaseURI(e.target.value);
  }

  function handleSymbolChange(e) {
    setSymbol(e.target.value);
  }

  function handleRoyaltiesChange(e) {
    setRoyalties(BigNumber.from(e.target.value));
  }

  function handleTokenSupplyChange(e) {
    setTokenSupply(e.target.value);
  }

  function handleSelectCategories(category: string) {
    const copiedCategories = { ...selectedCategories };
    if (selectedCategories[category]) {
      delete copiedCategories[category];
    } else {
      copiedCategories[category] = true;
    }
    setSelectedCategories(copiedCategories);
  }

  const NFT_ADDRESS =
    process.env.NEXT_PUBLIC_ZETASIS_COLLECTION_ADDRESS ??
    "0xB499Bc2AD48b86fd4AA9C94e081C213eDFD4bDf2";

  async function uploadImage() {
    if (!uploadedImage) return;

    const blob = new Blob([uploadedImage], { type: "image/png" });
    const imageToUpload = [new File([blob], "file.png")];
    const imageCID = await client.put(imageToUpload);
    const imageLink = `https://${imageCID}.ipfs.w3s.link/file.png`;

    return imageLink;
  }

  async function uploadJSON() {
    const imageCID = await uploadImage();

    // construct JSON metadata object
    const jsonObject: CollectionMetadata = {
      name: name,
      description: description,
      symbol: symbol,
      base_uri: baseURI,
      image:
        imageCID ??
        "https://bafybeie6rfxujzadhx5t3ofso6sckg33jknl5vhobmgby7uetpmbzaojvm.ipfs.w3s.link/preview.png",
      seller_fee_basis_points: royalties.toString(),
      fee_recipient: address,
    };

    const blob = new Blob([JSON.stringify(jsonObject)], {
      type: "application/json",
    });

    const files = [new File([blob], "metadata.json")];
    const jsonCID = await client.put(files);
    const jsonLink = `https://${jsonCID}.ipfs.w3s.link/metadata.json`;

    return { jsonLink, jsonObject };
  }
  async function deployGoerli() {
    if (!signer) return;
    setLoading((prevState) =>
      prevState.map((state, i) => (i + 1 === step ? true : state))
    );

    try {
      const { jsonLink: uploadedJSON, jsonObject: metadata } =
        await uploadJSON();
      console.log("collection metdata successfully uploaded: ", uploadedJSON);

      setCollectionURI(uploadedJSON);

      const contractFactory = new ethers.ContractFactory(
        NewNFT.abi,
        NewNFT.bytecode,
        signer
      );

      const goerliContract = await contractFactory.deploy(
        "0x00007d0BA516a2bA02D77907d3a1348C1187Ae62",
        "0xCc7bb2D219A0FC08033E130629C2B854b7bA9195",
        "0xDDB1C86c69f258F6d33377a8725404E4393326bB",
        true,
        name,
        symbol,
        baseURI,
        uploadedJSON,
        tokenSupply
      );

      switchNetwork(80001);

      console.log("contract deployed");
      console.log("goerli contract address: ", goerliContract.address);
      setGoerliContractAddress(goerliContract.address);
      incrementStep();
    } catch (err) {
      console.log(err);
    }
    setLoading((prevState) =>
      prevState.map((state, i) => (i + 1 === step ? false : state))
    );
  }

  async function deployPolygon() {
    if (!signer) return;
    setLoading((prevState) =>
      prevState.map((state, i) => (i + 1 === step ? true : state))
    );

    try {
      const polygonContractFactory = new ethers.ContractFactory(
        NewNFT.abi,
        NewNFT.bytecode,
        signer
      );

      const polygonContract = await polygonContractFactory.deploy(
        "0x000054d3A0Bc83Ec7808F52fCdC28A96c89F6C5c",
        "0x000080383847bd75f91c168269aa74004877592f",
        "0xCa7185cA7AB06fA60060d4D65C50b6883cc70419",
        true,
        name,
        symbol,
        baseURI,
        collectionURI,
        tokenSupply
      );

      console.log("contract deployed");
      console.log("polygon contract address: ", polygonContract.address);

      const response = await axios.post(`${API_URL}/collection`, {
        goerli: goerliContractAddress,
        polygon: polygonContract.address,
      });

      console.log(response);
      setCollectionId(response.data.collectionId);
      setPolygonContractAddress(polygonContract.address);
      incrementStep();
    } catch (err) {
      console.log(err);
    }
    setLoading((prevState) =>
      prevState.map((state, i) => (i + 1 === step ? false : state))
    );
  }

  async function setupConnectorPolygon() {
    setLoading((prevState) =>
      prevState.map((state, i) => (i + 1 === step ? true : state))
    );
    try {
      const polygonContract = new ethers.Contract(
        polygonContractAddress, // polygonContract.address
        NewNFT.abi,
        signer
      );

      await polygonContract.setInteractorByChainId(5, goerliContractAddress);

      switchNetwork(5);
      incrementStep();
    } catch (e) {
      console.error(e);
    }
    setLoading((prevState) =>
      prevState.map((state, i) => (i + 1 === step ? false : state))
    );
  }

  async function setupConnectorGoerli() {
    setLoading((prevState) =>
      prevState.map((state, i) => (i + 1 === step ? true : state))
    );
    try {
      const goerliContract = new ethers.Contract(
        goerliContractAddress, // goerliContract.address
        NewNFT.abi,
        signer
      );

      await goerliContract.setInteractorByChainId(
        80001,
        polygonContractAddress
      );
      onClose();
      setViewSuccessPage(true);
    } catch (e) {
      console.error(e);
    }
    setLoading((prevState) =>
      prevState.map((state, i) => (i + 1 === step ? false : state))
    );
  }

  if (isViewSuccessPage) {
    return (
      <main className={styles.main}>
        <VStack>
          <HStack pb="2rem">
            <Text className={styles.title}>CREATE NEW COLLECTION</Text>
          </HStack>
          <VStack h="400px" position="relative">
            <VStack className={styles.lottieContainer}>
              <SuccessLottie />
            </VStack>
          </VStack>
          <Text fontSize="16px" pb="1rem">
            Your contracts were successfully deployed.
          </Text>

          <HStack>
            <ChakraLink
              href={`https://goerli.etherscan.io/tx/${goerliContractAddress}`}
              isExternal
            >
              <Button className={styles.successButton}>
                View contract on Goerli
              </Button>
            </ChakraLink>
            <ChakraLink
              href={`https://mumbai.polygonscan.com/tx/${polygonContractAddress}`}
              isExternal
            >
              <Button className={styles.successButton}>
                View contract on Polygon
              </Button>
            </ChakraLink>
            <Link href={`/collection/${collectionId}`}>
              <Button className={styles.successButton}>View collection</Button>
            </Link>
          </HStack>
        </VStack>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <VStack>
        <HStack pb="2rem">
          <Text className={styles.title}>CREATE NEW COLLECTION</Text>
        </HStack>
        <HStack gap={10} alignItems="flex-start">
          <VStack gap={2}>
            <VStack>
              <Text w="100%">Cover Image</Text>
              {!uploadedImage ? (
                <VStack className={styles.uploadContainer}>
                  <input
                    type="file"
                    name="images"
                    id="images"
                    required
                    multiple
                    onChange={handleImageUpload}
                    className={styles.uploadInput}
                  />

                  <VStack className={styles.uploadTextContainer}>
                    <Text className={styles.uploadTitle}>Upload media</Text>
                    <Text className={styles.uploadTitle2}>
                      File types supported: png, jpg, gif
                    </Text>
                    <Text className={styles.uploadSubtitle}>
                      Max size: 100MB
                    </Text>
                  </VStack>
                </VStack>
              ) : (
                <Image
                  alt="preview"
                  src={uploadedImage ? URL.createObjectURL(uploadedImage) : ""}
                  className={styles.previewContainer}
                ></Image>
              )}
            </VStack>
            <VStack alignItems="flex-start">
              <Text>Token Supply</Text>
              <Input
                className={styles.input}
                onChange={handleTokenSupplyChange}
                value={tokenSupply}
                placeholder="10000"
              ></Input>
            </VStack>
          </VStack>
          <VStack alignItems="flex-end" gap={1}>
            <VStack alignItems="flex-start">
              <Text>Name</Text>
              <Input
                className={styles.input}
                onChange={handleNameChange}
                value={name}
              ></Input>
            </VStack>
            <VStack alignItems="flex-start">
              <Text>Symbol</Text>
              <Input
                className={styles.input}
                onChange={handleSymbolChange}
                value={symbol}
              ></Input>
            </VStack>
            <VStack alignItems="flex-start">
              <Text>Description</Text>
              <Input
                className={styles.input}
                onChange={handleDescriptionChange}
                value={description}
              ></Input>
            </VStack>
            <VStack alignItems="flex-start">
              <HStack>
                <Text>Base URI</Text>
                <ChakraLink
                  href="https://github.com/0xcarhartt/zetasis"
                  isExternal
                >
                  <InfoIcon opacity={0.8} />
                </ChakraLink>
              </HStack>
              <Input
                className={styles.input}
                onChange={handleBaseURIChange}
                value={baseURI}
              ></Input>
            </VStack>
            <VStack alignItems="flex-start">
              <Text>Networks</Text>
              {/* <Select
                // value={currentNetwork ? currentNetwork.id : "5"}
                className={styles.input}
                onChange={(e) => handleSelectCategories(e.target.value)}
              >
                <option value="5">Goerli</option>
                <option value="80001">Polygon Mumbai</option>
                <option value="97">BSC Testnet</option>
              </Select> */}
              <HStack
                className={styles.input}
                pl="1rem"
                onClick={() => setCategoriesVisible(!isCategoriesVisible)}
              >
                {Object.keys(selectedCategories).length === 0 ? (
                  <Text fontWeight={500}>Select networks</Text>
                ) : (
                  <HStack className={styles.selectedContainer}>
                    {Object.keys(selectedCategories).map((category) => (
                      <Highlight
                        key={category}
                        query={category}
                        styles={{
                          px: "1",
                          py: "1",
                          borderRadius: "5",
                          bg: "rgba(0,0,0,0.1)",
                          userSelect: "none",
                        }}
                      >
                        {category}
                      </Highlight>
                    ))}
                  </HStack>
                )}
              </HStack>
              {isCategoriesVisible && (
                <VStack className={styles.selectionContainer}>
                  {categoryOptions.map((category, idx) => (
                    <VStack key={idx}>
                      <HStack className={styles.selectionBox}>
                        <Checkbox
                          colorScheme="white"
                          size="lg"
                          pr="1rem"
                          defaultChecked={selectedCategories[category]}
                          onChange={() => handleSelectCategories(category)}
                        />
                        <Text className={styles.checkboxTitle}>{category}</Text>
                      </HStack>
                      <Divider></Divider>
                    </VStack>
                  ))}
                </VStack>
              )}
            </VStack>
            <Box h=".5rem"></Box>
            <HStack w="100%" justifyContent="space-between">
              <VStack>
                <Text>Create mint drop</Text>
                <Switch size="lg" colorScheme="blue" variant="custom" />
              </VStack>
              <Button className={styles.button} onClick={onOpen}>
                CREATE
              </Button>
            </HStack>
          </VStack>
        </HStack>
      </VStack>
      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay className={styles.modalOverlay} />
        <ModalContent className={styles.modalContent}>
          <ModalHeader className={styles.modalHeader}>
            Deploy cross-chain collection
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <HStack gap={3} className={styles.deployContainer}>
              {steps.map((stepData, index) => (
                <VStack
                  key={`step-${index + 1}`}
                  className={styles.stepContainer}
                  gap={4}
                  style={{ opacity: step === index + 1 ? 1 : 0.5 }}
                >
                  <Text>Step {index + 1}</Text>
                  <Box className={styles.circle}>
                    {step > index + 1 ? (
                      <CheckIcon />
                    ) : (
                      <Text>{index + 1}</Text>
                    )}
                  </Box>
                  <Text w="140px" textAlign="center">
                    {stepData.title}
                  </Text>
                  <Button
                    onClick={stepData.onClick}
                    className={styles.modalBtn}
                    isDisabled={step > index + 1}
                    isLoading={loading[index]}
                  >
                    {stepData.button}
                  </Button>
                </VStack>
              ))}
              <HStack className={styles.dividers}>
                <Box className={styles.space1} />
                <Box className={styles.dividerLine} />
                <Box className={styles.space2} />
                <Box className={styles.dividerLine} />
                <Box className={styles.space3} />
                <Box className={styles.dividerLine} />
                <Box className={styles.space4} />
              </HStack>
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </main>
  );
}
