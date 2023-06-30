import {
  HStack,
  VStack,
  Text,
  Image,
  SimpleGrid,
  Link as ChakraLink,
  Spinner,
  Button,
} from "@chakra-ui/react";
import withTransition from "@components/withTransition";
import { collections, tokens } from "@data/static";
import styles from "@styles/Collection.module.css";
import { abridgeAddress } from "@utils/abridgeAddress";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useProvider,
} from "wagmi";
import NewNFT from "@data/NewNFT.json";
import SilicateNFT from "@data/SilicateNFT.json";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SuccessLottie from "@components/SuccessLottie";
import { ethers } from "ethers";

function Collection() {
  const router = useRouter();
  const { address } = useAccount();
  const [collectionMetadata, setCollectionMetadata] = useState<any>();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [tokens, setTokens] = useState<any[]>([]);
  const { id: collectionAddress } = router.query;

  const { config } = usePrepareContractWrite({
    address:
      (collectionAddress as `0x${string}`) ??
      "0xB499Bc2AD48b86fd4AA9C94e081C213eDFD4bDf2",
    abi: NewNFT.abi,
    functionName: "mint()",
  });

  const { data: collectionURI } = useContractRead({
    address:
      (collectionAddress as `0x${string}`) ??
      "0xB499Bc2AD48b86fd4AA9C94e081C213eDFD4bDf2",
    abi: NewNFT.abi,
    functionName: "contractURI",
  });

  const { data: baseURI } = useContractRead({
    address:
      (collectionAddress as `0x${string}`) ??
      "0xB499Bc2AD48b86fd4AA9C94e081C213eDFD4bDf2",
    abi: NewNFT.abi,
    functionName: "getBaseURI",
  });

  const { data, isSuccess, write: mint } = useContractWrite(config);

  function handleMint() {
    console.log("mint:", mint);
    setLoading(true);
    mint();
  }

  const fetchCollection = useCallback(async () => {
    if (!collectionURI) return;
    const response = await fetch(collectionURI as string);
    const result = await response.json();

    setCollectionMetadata(result);
  }, [collectionURI]);

  const { data: lastTokenId } = useContractRead({
    address:
      (collectionAddress as `0x${string}`) ??
      "0xB499Bc2AD48b86fd4AA9C94e081C213eDFD4bDf2",
    abi: NewNFT.abi,
    functionName: "getLastTokenId",
  });

  const { data: tokenSupply } = useContractRead({
    address:
      (collectionAddress as `0x${string}`) ??
      "0xB499Bc2AD48b86fd4AA9C94e081C213eDFD4bDf2",
    abi: NewNFT.abi,
    functionName: "MAX_TOTAL_SUPPLY",
  });

  const fetchTokens = useCallback(async () => {
    if (!collectionAddress) return;

    const fetchedTokens = [];
    for (let i = 1; i <= lastTokenId; i++) {
      const response = await fetch(`${baseURI}/${1}` as string);
      const result = await response.json();
      fetchedTokens.push(result);
    }
    setTokens(fetchedTokens);
  }, [baseURI, collectionAddress, lastTokenId]);

  useEffect(() => {
    if (!collectionMetadata) {
      fetchCollection();
    }
    if (collectionAddress && tokens.length === 0) {
      fetchTokens();
    }
  }, [
    baseURI,
    collectionAddress,
    collectionMetadata,
    fetchCollection,
    fetchTokens,
    tokens.length,
  ]);

  const navigationLink = useMemo(
    () =>
      lastTokenId
        ? `/collection/${collectionAddress}/${
            parseInt(lastTokenId as string, 10) + 1
          }`
        : `/collection/${collectionAddress}`,
    [collectionAddress, lastTokenId]
  );

  if (collectionAddress === "0xB499Bc2AD48b86fd4AA9C94e081C213eDFD4bDf2") {
    return (
      <SampleCollection
        collectionAddress={collectionAddress}
        lastTokenId={lastTokenId}
      />
    );
  }

  if (!collectionMetadata)
    return (
      <HStack className={styles.main} h="100vh">
        <Spinner color="white" size="xl" />
      </HStack>
    );

  if (isSuccess) {
    return (
      <main className={styles.successContainer}>
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
              href={
                data
                  ? `https://explorer.testnet.mantle.xyz/tx/${data.hash}`
                  : "https://explorer.testnet.mantle.xyz"
              }
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
    <HStack className={styles.main}>
      <VStack className={styles.detailContainer}>
        <VStack className={styles.detailContentContainer}>
          <Image
            alt="silicate collection"
            src={collectionMetadata.image}
            className={styles.collectionCover}
          ></Image>
          <Text className={styles.title}>{collectionMetadata.name}</Text>
          <Text className={styles.owner}>
            {`by ${abridgeAddress(collectionMetadata.fee_recipient)}`}
          </Text>
          <Text className={styles.description}>
            {collectionMetadata.description}
          </Text>
          <HStack gap={1}>
            <ChakraLink
              href={`https://explorer.testnet.mantle.xyz/address/${collectionAddress}`}
              isExternal
            >
              <Image
                alt="explorer"
                src="/explorer.png"
                className={styles.explorerIcon}
              ></Image>
            </ChakraLink>
            <ChakraLink
              href={
                (baseURI as string) ??
                "https://bafybeiavfji7bfrip3dbg23laqgkwi7f2sntmp42tvr7qdecd2hw6a2zky.ipfs.w3s.link/1.json"
              }
              isExternal
            >
              <Image
                alt="ipfs"
                src="/ipfs.png"
                className={styles.ipfsIcon}
              ></Image>
            </ChakraLink>
            <ChakraLink href="https://www.silicate.dev/" isExternal>
              <Image
                alt="web"
                src="/website.png"
                className={styles.webIcon}
              ></Image>
            </ChakraLink>
          </HStack>
        </VStack>
        {lastTokenId < tokenSupply && (
          <VStack w="100%">
            <Button className={styles.mintButton} onClick={handleMint}>
              {" "}
              {isLoading ? <Spinner color="white" /> : "MINT"}
            </Button>
            <Text
              className={styles.mintLabel}
            >{`${lastTokenId}/10000 Minted`}</Text>
          </VStack>
        )}
      </VStack>
      <VStack className={styles.gridContainer}>
        {lastTokenId == 0 ? (
          <VStack height="70vh" justifyContent="center">
            <Text>No tokens minted yet</Text>
          </VStack>
        ) : (
          <SimpleGrid columns={4} w="100%" gap={3}>
            {[...tokens].map(({ image, name }, idx) => (
              <Link
                href={`/collection/${collectionAddress}/${idx + 1}`}
                key={idx}
              >
                <VStack className={styles.tokenCardContainer}>
                  <Image
                    alt={name}
                    src={`https:ipfs.io/ipfs/${image.split("//")[1]}`}
                    className={styles.tokenImage}
                  ></Image>
                  <VStack w="100%" padding="4px 12px 2px 12px">
                    <HStack w="100%" justifyContent="space-between">
                      <Text className={styles.tokenTitle}>{name}</Text>
                      <Text className={styles.tokenId}>{`ID: ${idx + 1}`}</Text>
                    </HStack>
                    <HStack w="100%">
                      <Text className={styles.tokenOwnerLabel}>OWNER:</Text>
                      <Text className={styles.tokenOwner}>
                        {abridgeAddress(address)}
                      </Text>
                    </HStack>
                  </VStack>
                </VStack>
              </Link>
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </HStack>
  );
}

function SampleCollection({ collectionAddress, lastTokenId }) {
  const collection = collections[collectionAddress as string];
  const provider = useProvider();
  const [tokens, setTokens] = useState([]);

  const contract = new ethers.Contract(
    collectionAddress as string,
    SilicateNFT.abi,
    provider
  );

  useEffect(() => {
    if (tokens.length === 0) {
      fetchTokens();
    }
  });

  async function fetchTokens() {
    const fetchedTokens = [];
    for (let i = 17; i <= lastTokenId; i++) {
      const tokenURI = await contract.tokenURI(i);
      const owner = await contract.ownerOf(i);
      const response = await fetch(tokenURI as string);
      const result = await response.json();

      fetchedTokens.push({ ...result, owner, id: i });
    }
    setTokens(fetchedTokens);
  }

  return (
    <HStack className={styles.main}>
      <VStack className={styles.detailContainer}>
        <VStack className={styles.detailContentContainer}>
          <Image
            alt="silicate collection"
            src={collection.image}
            className={styles.collectionCover}
          ></Image>
          <Text className={styles.title}>{collection.title}</Text>
          <Text className={styles.owner}>
            {`by ${abridgeAddress(collection.creator)}`}
          </Text>
          <Text className={styles.description}>{collection.description}</Text>
          <HStack gap={1}>
            <ChakraLink
              href="https://explorer.testnet.mantle.xyz/address/0xB499Bc2AD48b86fd4AA9C94e081C213eDFD4bDf2"
              isExternal
            >
              <Image
                alt="explorer"
                src="/explorer.png"
                className={styles.explorerIcon}
              ></Image>
            </ChakraLink>
            <ChakraLink
              href="https://bafybeiavfji7bfrip3dbg23laqgkwi7f2sntmp42tvr7qdecd2hw6a2zky.ipfs.w3s.link/1.json"
              isExternal
            >
              <Image
                alt="ipfs"
                src="/ipfs.png"
                className={styles.ipfsIcon}
              ></Image>
            </ChakraLink>
            <ChakraLink href="https://www.silicate.dev/" isExternal>
              <Image
                alt="web"
                src="/website.png"
                className={styles.webIcon}
              ></Image>
            </ChakraLink>
          </HStack>
        </VStack>
      </VStack>
      <VStack className={styles.gridContainer}>
        <SimpleGrid columns={4} w="100%" gap={3}>
          {[...tokens, ...collection.tokens].map(
            ({ image, name, owner, id }, idx) => (
              <VStack key={idx} className={styles.tokenCardContainer}>
                <Image
                  alt={name}
                  src={image}
                  className={styles.tokenImage}
                ></Image>
                <VStack w="100%" padding="4px 12px 2px 12px">
                  <HStack w="100%" justifyContent="space-between">
                    <Text className={styles.tokenTitle}>{name}</Text>
                    <Text className={styles.tokenId}>{`ID: ${id}`}</Text>
                  </HStack>
                  <HStack w="100%">
                    <Text className={styles.tokenOwnerLabel}>OWNER:</Text>
                    <Text className={styles.tokenOwner}>
                      {abridgeAddress(owner)}
                    </Text>
                  </HStack>
                </VStack>
              </VStack>
            )
          )}
        </SimpleGrid>
      </VStack>
    </HStack>
  );
}

export default withTransition(Collection);
