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
import { useEffect, useState } from "react";
import SuccessLottie from "@components/SuccessLottie";
import { useContractWrite, usePrepareContractWrite, useSigner } from "wagmi";
import SilicateNFT from "@data/SilicateNFT.json";
import Link from "next/link";
import { ethers } from "ethers";

function Create() {
  const [uploadedImage, setUploadedImage] = useState<any>();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isViewSuccessPage, setViewSuccessPage] = useState<boolean>(false);
  const [publishedContract, setPublishedContract] = useState<string>("");
  const { data: signer, isError } = useSigner();
  const router = useRouter();
  const { type } = router.query;

  const { config } = usePrepareContractWrite({
    address: "0xB499Bc2AD48b86fd4AA9C94e081C213eDFD4bDf2",
    abi: SilicateNFT.abi,
    functionName: "mint()",
  });

  const { data, isSuccess, write: mint } = useContractWrite(config);

  const { id } = router.query;

  async function deployContract() {
    if (!signer) return;
    setLoading(true);
    try {
      // const [collectionURI, imageURI] = await uploadMetadata();

      const contractFactory = new ethers.ContractFactory(
        SilicateNFT.abi,
        SilicateNFT.bytecode,
        signer
      );

      const contract = await contractFactory.deploy(
        "0xB8E93eF7B186A090d15fe4fb3F76A0E1d643b86A"
      );

      console.log("contract deployed");
      console.log("contract address: ", contract.address);
      setPublishedContract(contract.address);
      // saveContract(contract.address, imageURI);
    } catch (err) {
      console.log(err);
    }
  }

  function handleImageUpload(e) {
    setUploadedImage(URL.createObjectURL(e.target.files[0]));
  }

  function handleMint() {
    setLoading(true);
    mint();
  }

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        setViewSuccessPage(true);
        setLoading(false);
      }, 3000);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (publishedContract) {
      setTimeout(() => {
        setViewSuccessPage(true);
        setLoading(false);
      }, 3000);
    }
  }, [publishedContract]);

  if (isViewSuccessPage) {
    if (type === "token") {
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
                href={`https://explorer.testnet.mantle.xyz/tx/${data.hash}`}
                isExternal
              >
                <Button className={styles.successButton}>
                  View transaction
                </Button>
              </ChakraLink>
              <Link href="/collection/1/1">
                <Button className={styles.successButton}>View token</Button>
              </Link>
            </HStack>
          </VStack>
        </main>
      );
    } else {
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
              <Link href="/collection/1">
                <Button className={styles.successButton}>
                  View collection
                </Button>
              </Link>
            </HStack>
          </VStack>
        </main>
      );
    }
  }

  if (type === "token") {
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
                    src={uploadedImage ?? ""}
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
                    <Input className={styles.subinput}></Input>
                  </VStack>
                  <VStack alignItems="flex-start">
                    <Text className={styles.inputSubtitle}>Value</Text>
                    <Input className={styles.subinput}></Input>
                  </VStack>
                </HStack>
              </VStack>
            </VStack>
            <VStack alignItems="flex-end" gap={1}>
              <VStack alignItems="flex-start">
                <Text>Name</Text>
                <Input className={styles.input}></Input>
              </VStack>
              <VStack alignItems="flex-start">
                <Text>Description</Text>
                <Input className={styles.input}></Input>
              </VStack>
              <VStack alignItems="flex-start">
                <Text>External link</Text>
                <Input className={styles.input}></Input>
              </VStack>
              <VStack alignItems="flex-start">
                <Text>Collection</Text>
                <Input
                  className={styles.input}
                  placeholder="Silicate Collection (default) "
                ></Input>
              </VStack>
              <VStack alignItems="flex-start">
                <Text>Royalties</Text>
                <Input className={styles.input} placeholder="5%"></Input>
              </VStack>
              <Box h="1rem"></Box>
              <Button className={styles.button} onClick={handleMint}>
                {isLoading ? <Spinner color="white" /> : "CREATE"}
              </Button>
            </VStack>
          </HStack>
        </VStack>
      </main>
    );
  } else {
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
                    src={uploadedImage ?? ""}
                    className={styles.previewContainer}
                  ></Image>
                )}
              </VStack>
              <VStack alignItems="flex-start">
                <Text>Token Supply</Text>
                <Input className={styles.input} placeholder="10000"></Input>
              </VStack>
            </VStack>
            <VStack alignItems="flex-end" gap={1}>
              <VStack alignItems="flex-start">
                <Text>Name</Text>
                <Input className={styles.input}></Input>
              </VStack>
              <VStack alignItems="flex-start">
                <Text>Symbol</Text>
                <Input className={styles.input}></Input>
              </VStack>
              <VStack alignItems="flex-start">
                <Text>Description</Text>
                <Input className={styles.input}></Input>
              </VStack>
              <VStack alignItems="flex-start">
                <Text>Base URI</Text>
                <Input className={styles.input}></Input>
              </VStack>
              <VStack alignItems="flex-start">
                <Text>Royalties</Text>
                <Input className={styles.input} placeholder="5%"></Input>
              </VStack>
              <Box h=".5rem"></Box>
              <HStack w="100%" justifyContent="space-between">
                <VStack>
                  <Text>Create mint drop</Text>
                  <Switch size="lg" colorScheme="blue" />
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
}

export default withTransition(Create);
