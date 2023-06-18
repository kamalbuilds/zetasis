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
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import SilicateNFT from "@data/SilicateNFT.json";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import SuccessLottie from "@components/SuccessLottie";

function Collection() {
  const router = useRouter();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isViewSuccessPage, setViewSuccessPage] = useState<boolean>(false);
  const { id } = router.query;
  const tokensMinted = 1;
  const collection = collections[id as string];

  const { config } = usePrepareContractWrite({
    address: "0xB499Bc2AD48b86fd4AA9C94e081C213eDFD4bDf2",
    abi: SilicateNFT.abi,
    functionName: "mint()",
  });

  const { data, isSuccess, write: mint } = useContractWrite(config);

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

  if (!collection)
    return (
      <VStack className={styles.loadingContainer}>
        <Spinner color="white" size="xl" />
      </VStack>
    );

  if (false) {
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
            <Link href="/collection/1/1">
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
        {collection.mintable && (
          <VStack w="100%">
            <Button className={styles.mintButton} onClick={handleMint}>
              {" "}
              {isLoading ? <Spinner color="white" /> : "MINT"}
            </Button>
            <Text
              className={styles.mintLabel}
            >{`${tokensMinted}/10000 Minted`}</Text>
          </VStack>
        )}
      </VStack>
      <VStack className={styles.gridContainer}>
        {tokensMinted == 0 ? (
          <VStack height="70vh" justifyContent="center">
            <Text>No tokens minted yet</Text>
          </VStack>
        ) : (
          <SimpleGrid columns={4} w="100%" gap={3}>
            {collection.tokens
              .slice(0, tokensMinted)
              .map(({ image, name, owner, id }, idx) => (
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
              ))}
          </SimpleGrid>
        )}
      </VStack>
    </HStack>
  );
}

export default withTransition(Collection);
