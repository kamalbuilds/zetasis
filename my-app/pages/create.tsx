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
  Link as ChakraLink,
} from "@chakra-ui/react";
import styles from "../styles/Create.module.css";
import { useRouter } from "next/router";
import withTransition from "@components/withTransition";
import { AddIcon } from "@chakra-ui/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Web3Storage } from "web3.storage";
import SuccessLottie from "@components/SuccessLottie";
import { useAccount, useContractRead, useSigner } from "wagmi";
import SilicateNFT from "@data/SilicateNFT.json";
import NewNFT from "@data/NewNFT.json";
import Link from "next/link";
import { BigNumber, ethers } from "ethers";
import { CollectionMetadata, TokenMetadata } from "@utils/types";
import { createAsset } from "@utils/web3";
import { InfoIcon } from "@chakra-ui/icons";

const WEB3_STORAGE_TOKEN = process.env.NEXT_PUBLIC_WEB3_STORAGE_API_KEY;

const client = new Web3Storage({
  token: WEB3_STORAGE_TOKEN,
  endpoint: new URL("https://api.web3.storage"),
});

function Create() {
  const router = useRouter();
  const { type } = router.query;

  if (type === "token") {
    return <CreateToken />;
  } else {
    return <CreateCollection />;
  }
}

function CreateToken() {
  const { address } = useAccount();
  const { data: signer, isError } = useSigner();
  const [uploadedImage, setUploadedImage] = useState<any>();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [collection, setCollection] = useState<string>("");
  const [externalURL, setExternalURL] = useState<string>("");
  const [trait, setTrait] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [txnHash, setTxnHash] = useState<string>("");

  function handleImageUpload(e) {
    setUploadedImage(e.target.files[0]);
  }

  function handleNameChange(e) {
    setName(e.target.value);
  }

  function handleDescriptionChange(e) {
    setDescription(e.target.value);
  }

  function handleCollectionChange(e) {
    setCollection(e.target.value);
  }

  function handleExternalURLChange(e) {
    setExternalURL(e.target.value);
  }

  function handleTraitChange(e) {
    setTrait(e.target.value);
  }

  function handleValueChange(e) {
    setValue(e.target.value);
  }

  const NFT_ADDRESS =
    process.env.NEXT_PUBLIC_NEXUS_COLLECTION_ADDRESS ??
    "0xB499Bc2AD48b86fd4AA9C94e081C213eDFD4bDf2";

  async function uploadImage() {
    if (!uploadedImage) return;

    const blob = new Blob([uploadedImage], { type: "image/png" });
    const imageToUpload = [new File([blob], "file.png")];
    const imageCID = await client.put(imageToUpload);
    const imageLink = `https://${imageCID}.ipfs.w3s.link/file.png`;

    return imageLink;
  }

  const { data: lastTokenId } = useContractRead({
    address:
      (process.env.NEXT_PUBLIC_SILICATE_COLLECTION_ADDRESS as `0x${string}`) ??
      "0xB499Bc2AD48b86fd4AA9C94e081C213eDFD4bDf2",
    abi: SilicateNFT.abi,
    functionName: "getLastTokenId",
  });

  async function uploadJSON() {
    const imageCID = await uploadImage();

    // construct JSON metadata object
    const jsonObject: TokenMetadata = {
      name: name,
      description: description,
      collection: collection != "" ? collection : "Silicate Collection 1",
      external_url: externalURL,
      image:
        imageCID ??
        "https://bafybeie6rfxujzadhx5t3ofso6sckg33jknl5vhobmgby7uetpmbzaojvm.ipfs.w3s.link/preview.png",
      attributes: [
        {
          trait_type: trait,
          value: value,
        },
      ],
    };

    const blob = new Blob([JSON.stringify(jsonObject)], {
      type: "application/json",
    });

    const files = [new File([blob], "metadata.json")];
    const jsonCID = await client.put(files);
    const jsonLink = `https://${jsonCID}.ipfs.w3s.link/metadata.json`;

    return { jsonLink, jsonObject };
  }

  const handleMint = useCallback(
    async (cid: string) => {
      try {
        const contract = new ethers.Contract(
          NFT_ADDRESS,
          SilicateNFT.abi,
          signer
        );

        const nftResult = await contract["mint(string)"](cid);
        console.log("nftresult: ", JSON.stringify(nftResult, null, 2));
        setTxnHash(nftResult.hash);

        return nftResult;
      } catch (e) {
        console.log(e);
      }
    },
    [NFT_ADDRESS, signer]
  );

  async function handleListAsset() {
    setLoading(true);
    const { jsonLink: uploadedJSON, jsonObject: metadata } = await uploadJSON();
    console.log("TokenMetadata successfully uploaded to IPFS: ", uploadedJSON);
    const nftResult = await handleMint(uploadedJSON);

    // if (nftResult) {
    //   await createAsset(
    //     NFT_ADDRESS,
    //     (parseInt(lastTokenId as string, 10) + 1).toString(),
    //     metadata,
    //     address
    //   );
    // }
    setLoading(false);
  }

  const navigationLink = useMemo(
    () =>
      lastTokenId
        ? `/collection/${NFT_ADDRESS}/${
            parseInt(lastTokenId as string, 10) + 1
          }`
        : `/collection/${NFT_ADDRESS}`,
    [NFT_ADDRESS, lastTokenId]
  );

  if (!address) {
    return (
      <VStack className={styles.main}>
        <VStack w="100%">
          <Text className={styles.title}>Oops! Wait a minute.</Text>
          <Text className={styles.inputHeader}>
            Please connect your wallet before you proceed.
          </Text>
        </VStack>
      </VStack>
    );
  }

  if (txnHash) {
    return (
      <main className={styles.main}>
        <VStack>
          <HStack pb="2rem">
            <Text className={styles.title}>CREATE NEW ITEM</Text>
          </HStack>
          <VStack h="400px" position="relative">
            <VStack className={styles.lottieContainer}>
              <SuccessLottie />
            </VStack>
          </VStack>
          <Text fontSize="16px" pb="1rem">
            Your token was successfully minted.
          </Text>

          <HStack>
            <ChakraLink
              href={`https://explorer.testnet.mantle.xyz/tx/${txnHash}`}
              isExternal
            >
              <Button className={styles.successButton}>View transaction</Button>
            </ChakraLink>
            <Link href={navigationLink}>
              <Button className={styles.successButton}>View token</Button>
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
          <Text className={styles.title}>CREATE NEW ITEM</Text>
        </HStack>
        <HStack gap={10} alignItems="flex-start">
          <VStack gap={2}>
            <VStack>
              <Text w="100%">Media</Text>
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
            <VStack>
              <HStack
                w="100%"
                justifyContent="space-between"
                alignItems="flex-end"
                paddingRight=".5rem"
              >
                <Text>Properties</Text>
                <AddIcon w={3} h={3} />
              </HStack>
              <HStack>
                <VStack alignItems="flex-start">
                  <Text className={styles.inputSubtitle}>Trait name</Text>
                  <Input
                    className={styles.subinput}
                    onChange={handleTraitChange}
                    value={trait}
                  ></Input>
                </VStack>
                <VStack alignItems="flex-start">
                  <Text className={styles.inputSubtitle}>Value</Text>
                  <Input
                    className={styles.subinput}
                    onChange={handleValueChange}
                    value={value}
                  ></Input>
                </VStack>
              </HStack>
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
              <Text>Description</Text>

              <Input
                className={styles.input}
                onChange={handleDescriptionChange}
                value={description}
              ></Input>
            </VStack>
            <VStack alignItems="flex-start">
              <Text>External link</Text>
              <Input
                className={styles.input}
                onChange={handleExternalURLChange}
                value={externalURL}
              ></Input>
            </VStack>
            <VStack alignItems="flex-start">
              <Text>Collection</Text>
              <Input
                className={styles.input}
                onChange={handleCollectionChange}
                value={collection}
                placeholder="Silicate Collection (default) "
              ></Input>
            </VStack>
            <VStack alignItems="flex-start">
              <Text>Royalties</Text>
              <Input className={styles.input} placeholder="5%"></Input>
            </VStack>
            <Box h="1rem"></Box>
            <Button className={styles.button} onClick={handleListAsset}>
              {isLoading ? <Spinner color="white" /> : "CREATE"}
            </Button>
          </VStack>
        </HStack>
      </VStack>
    </main>
  );
}

function CreateCollection() {
  const { address } = useAccount();
  const [uploadedImage, setUploadedImage] = useState<any>();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [publishedContract, setPublishedContract] = useState<string>("");
  const { data: signer, isError } = useSigner();

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [collection, setCollection] = useState<string>("");
  const [externalURL, setExternalURL] = useState<string>("");
  const [baseURI, setBaseURI] = useState<string>("");
  const [tokenSupply, setTokenSupply] = useState<number>(10000);
  const [symbol, setSymbol] = useState<string>("");
  const [royalties, setRoyalties] = useState<BigNumber>(BigNumber.from(5));
  const [txnHash, setTxnHash] = useState<string>("");

  const [isViewSuccessPage, setViewSuccessPage] = useState<boolean>(false);

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

  const NFT_ADDRESS =
    process.env.NEXT_PUBLIC_NEXUS_COLLECTION_ADDRESS ??
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

  const handleDeploy = useCallback(
    async (cid: string) => {
      try {
        const contract = new ethers.Contract(
          NFT_ADDRESS,
          SilicateNFT.abi,
          signer
        );

        const nftResult = await contract["mint(string)"](cid);
        console.log("nftresult: ", JSON.stringify(nftResult, null, 2));
        setTxnHash(nftResult.hash);

        return nftResult;
      } catch (e) {
        console.log(e);
      }
    },
    [NFT_ADDRESS, signer]
  );

  async function deployContract() {
    if (!signer) return;
    setLoading(true);

    try {
      const { jsonLink: uploadedJSON, jsonObject: metadata } =
        await uploadJSON();

      console.log("collection metdata successfully uploaded: ", uploadedJSON);

      const contractFactory = new ethers.ContractFactory(
        NewNFT.abi,
        NewNFT.bytecode,
        signer
      );

      const contract = await contractFactory.deploy(
        name,
        symbol,
        tokenSupply,
        uploadedJSON,
        baseURI ??
          "https://ipfs.io/ipfs/QmZcH4YvBVVRJtdn4RdbaqgspFU8gH6P9vomDpBVpAL3u4",
        address
      );

      console.log("contract deployed");
      console.log("contract address: ", contract.address);
      setPublishedContract(contract.address);
      // saveContract(contract.address, imageURI);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  }

  if (publishedContract) {
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
            Your collection was successfully deployed.
          </Text>

          <HStack>
            <ChakraLink
              href={`https://explorer.testnet.mantle.xyz/address/${publishedContract}`}
              isExternal
            >
              <Button className={styles.successButton}>View contract</Button>
            </ChakraLink>
            <Link href={`/collection/${publishedContract}`}>
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
                  href="https://github.com/0xcarhartt/silicate"
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
              <Text>Royalties</Text>
              <Input
                className={styles.input}
                onChange={handleRoyaltiesChange}
                value={royalties.toString()}
                placeholder="5%"
              ></Input>
            </VStack>
            <Box h=".5rem"></Box>
            <HStack w="100%" justifyContent="space-between">
              <VStack>
                <Text>Create mint drop</Text>
                <Switch size="lg" colorScheme="blue" variant="custom" />
              </VStack>
              <Button className={styles.button} onClick={deployContract}>
                {isLoading ? <Spinner color="white" /> : "CREATE"}
              </Button>
            </HStack>
          </VStack>
        </HStack>
      </VStack>
    </main>
  );
}

export default withTransition(Create);
