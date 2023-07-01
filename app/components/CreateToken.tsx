import {
  HStack,
  VStack,
  Text,
  Input,
  Button,
  Box,
  Image,
  Spinner,
  Link as ChakraLink,
  Select,
} from "@chakra-ui/react";
import styles from "../styles/Create.module.css";
import { AddIcon } from "@chakra-ui/icons";
import { useCallback, useMemo, useState } from "react";
import SuccessLottie from "@components/SuccessLottie";
import { useAccount, useContractRead, useNetwork, useSigner } from "wagmi";
import ZetasisNFT from "@data/ZetasisNFT.json";
import Link from "next/link";
import { ethers } from "ethers";
import { TokenMetadata } from "@utils/types";
import { client } from "@utils/web3";
import { useSwitchNetwork } from "wagmi";

export default function CreateToken() {
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
  const {
    chains,
    error,
    isLoading: isNetworkLoading,
    switchNetwork,
  } = useSwitchNetwork();
  const { chain: currentNetwork } = useNetwork();

  function handleImageUpload(e) {
    setUploadedImage(e.target.files[0]);
  }

  function handleNameChange(e) {
    setName(e.target.value);
  }

  function handleDescriptionChange(e) {
    setDescription(e.target.value);
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

  let NFT_ADDRESS;
  let EXPLORER_URI;

  switch (currentNetwork.id) {
    case 5:
      NFT_ADDRESS = process.env.NEXT_PUBLIC_ZETASIS_ADDRESS_GOERLI;
      EXPLORER_URI = "https://goerli.etherscan.io/tx/";
      break;
    case 80001:
      NFT_ADDRESS = process.env.NEXT_PUBLIC_ZETASIS_ADDRESS_MUMBAI;
      EXPLORER_URI = "https://mumbai.polygonscan.com/tx/";
      break;
    default:
      NFT_ADDRESS =
        process.env.NEXT_PUBLIC_ZETASIS_ADDRESS ??
        "0x0e2ab2707482d6cfe2dc006f2ee4442aa1377d3f";
      EXPLORER_URI = "https://explorer.athens.zetachain.com/cc/tx/";
      break;
  }

  async function uploadImage() {
    if (!uploadedImage) return;

    const blob = new Blob([uploadedImage], { type: "image/png" });
    const imageToUpload = [new File([blob], "file.png")];
    const imageCID = await client.put(imageToUpload);
    const imageLink = `https://${imageCID}.ipfs.w3s.link/file.png`;

    return imageLink;
  }

  const { data: lastTokenId } = useContractRead({
    address: NFT_ADDRESS ?? "0x0e2ab2707482d6cfe2dc006f2ee4442aa1377d3f",
    abi: ZetasisNFT.abi,
    functionName: "getLastTokenId",
  });

  async function uploadJSON() {
    const imageCID = await uploadImage();

    // construct JSON metadata object
    const jsonObject: TokenMetadata = {
      name: name,
      description: description,
      collection: collection != "" ? collection : "Zetasis Collection 1",
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

  const mint = useCallback(
    async (cid) => {
      try {
        const contract = new ethers.Contract(
          NFT_ADDRESS,
          ZetasisNFT.abi,
          signer
        );

        const nftResult = await contract.mint(cid);
        console.log("nftresult: ", JSON.stringify(nftResult, null, 2));
        setTxnHash(nftResult.hash);

        return nftResult;
      } catch (e) {
        console.log(e);
      }
    },
    [NFT_ADDRESS, signer]
  );

  async function handleMint() {
    setLoading(true);
    const { jsonLink: uploadedJSON, jsonObject: metadata } = await uploadJSON();
    console.log("TokenMetadata successfully uploaded to IPFS: ", uploadedJSON);
    await mint(uploadedJSON);

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
            <ChakraLink href={`${EXPLORER_URI}${txnHash}`} isExternal>
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
          <VStack alignItems="flex-end" gap={2}>
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
            <VStack alignItems="flex-start" pointerEvents="none">
              <Text>Collection</Text>
              <Box className={styles.input}>
                <Text pl="1rem" pt="1rem" opacity={0.4}>
                  Zetasis Collection (default)
                </Text>
              </Box>
            </VStack>
            <VStack alignItems="flex-start">
              <Text>Network</Text>
              <Select
                value={currentNetwork ? currentNetwork.id : "5"}
                className={styles.input}
                onChange={(e) => {
                  const selectedChainId = Number(e.target.value);
                  if (selectedChainId !== currentNetwork.id) {
                    switchNetwork(selectedChainId);
                  }
                }}
              >
                <option value="5">Goerli</option>
                <option value="80001">Polygon Mumbai</option>
                <option value="97">BSC Testnet</option>
              </Select>
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
}
