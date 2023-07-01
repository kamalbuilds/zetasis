import {
  HStack,
  VStack,
  Text,
  Image,
  Box,
  Link as ChakraLink,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Spinner,
  Button,
  Select,
} from "@chakra-ui/react";
import withTransition from "@components/withTransition";
import styles from "@styles/Token.module.css";
import { abridgeAddress } from "@utils/abridgeAddress";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAccount, useContractRead, useNetwork, useSigner } from "wagmi";
import ZetasisNFT from "@data/ZetasisNFT.json";
import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { parseEther } from "@ethersproject/units";

function Asset() {
  const router = useRouter();
  const { address } = useAccount();
  const { data: signer, isError } = useSigner();
  const [metadata, setMetadata] = useState<any>();
  const { id: collectionAddress, tid: tokenId } = router.query;
  const [isLoading, setLoading] = useState<boolean>(false);
  const [txnHash, setTxnHash] = useState<string>("");
  const { chain: currentNetwork } = useNetwork();
  const [selectedNetwork, setSelectedNetwork] = useState<string>(
    currentNetwork ? currentNetwork.id.toString() : "5"
  );

  const { data: tokenURI } = useContractRead({
    address:
      (collectionAddress as `0x${string}`) ??
      "0xB499Bc2AD48b86fd4AA9C94e081C213eDFD4bDf2",
    abi: ZetasisNFT.abi,
    functionName: "tokenURI",
    args: [tokenId ?? "1"],
  });

  const { data: owner } = useContractRead({
    address:
      (collectionAddress as `0x${string}`) ??
      "0xB499Bc2AD48b86fd4AA9C94e081C213eDFD4bDf2",
    abi: ZetasisNFT.abi,
    functionName: "ownerOf",
    args: [tokenId ?? "1"],
  });

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

  const transfer = useCallback(async () => {
    setLoading(true);
    try {
      const contract = new ethers.Contract(
        collectionAddress as string,
        ZetasisNFT.abi,
        signer
      );

      const nftResult = await contract.crossChainTransfer(
        "80001",
        address,
        tokenId as string,
        {
          value: parseEther("0.2"),
        }
      );

      setTxnHash(nftResult.hash);

      setLoading(false);
      return nftResult;
    } catch (e) {
      console.log(e);
    }
  }, [address, collectionAddress, signer, tokenId]);

  const fetchToken = useCallback(async () => {
    if (!tokenURI) return;
    const response = await fetch(
      "https://ipfs.io/ipfs/QmZcH4YvBVVRJtdn4RdbaqgspFU8gH6P9vomDpBVpAL3u4/1" as string
    );
    const result = await response.json();

    setMetadata(result);
  }, [tokenURI]);

  useEffect(() => {
    if (!metadata) {
      fetchToken();
    }
  }, [fetchToken, metadata]);

  if (!tokenId || !metadata || !owner)
    return (
      <VStack className={styles.main}>
        <Spinner />
      </VStack>
    );

  return (
    <VStack className={styles.main}>
      <VStack className={styles.tokenContainer}>
        <VStack className={styles.tokenImageContainer}>
          <Image
            alt="zetasis token"
            src={
              !metadata.image.startsWith("ipfs://")
                ? metadata.image
                : `https:ipfs.io/ipfs/${metadata.image.split("//")[1]}`
            }
            className={styles.image}
          ></Image>
          <Image
            alt="token image"
            src="/goerli.png"
            className={styles.networkIcon}
          ></Image>
        </VStack>
        <VStack className={styles.tokenDetailContainer}>
          <HStack w="100%" justifyContent="space-between">
            <Text className={styles.name}>{metadata.name}</Text>
            <HStack>
              <ChakraLink
                href={`https://testnets.opensea.io/assets/goerli/${collectionAddress}/${tokenId}`}
                isExternal
              >
                <Image
                  alt="explorer"
                  src="/explorer.png"
                  className={styles.explorerIcon}
                ></Image>
              </ChakraLink>
              <ChakraLink href={tokenURI as string} isExternal>
                <Image
                  alt="ipfs"
                  src="/ipfs.png"
                  className={styles.ipfsIcon}
                ></Image>
              </ChakraLink>
              <ChakraLink href={metadata.external_url} isExternal>
                <Image
                  alt="web"
                  src="/website.png"
                  className={styles.webIcon}
                ></Image>
              </ChakraLink>
            </HStack>
          </HStack>
          <Text className={styles.description}>{metadata.description}</Text>
          <Accordion w="100%" variant="custom" allowToggle>
            <AccordionItem border="none">
              <AccordionButton border="none !important">
                <HStack
                  w="100%"
                  justifyContent="space-between"
                  alignItems="flex-end"
                >
                  <VStack className={styles.fieldContainer}>
                    <Text className={styles.header}>OWNED BY</Text>
                    <Text className={styles.value}>
                      {abridgeAddress(owner as string)}
                    </Text>
                  </VStack>
                  <Text className={styles.header}>View details</Text>
                </HStack>
              </AccordionButton>
              <AccordionPanel>
                <VStack w="100%">
                  <HStack w="100%" justifyContent="center" p="20px 0 10px 0">
                    <Box className={styles.divider}></Box>
                  </HStack>
                  <HStack w="100%" alignItems="flex-end">
                    <VStack className={styles.fieldContainerPadded}>
                      <Text className={styles.header}>COLLECTION</Text>
                      <Link href={`/collection/${collectionAddress}`}>
                        <Text className={styles.value}>
                          {metadata.collection ? metadata.collection : "Azuki"}
                        </Text>
                      </Link>
                    </VStack>
                    <VStack className={styles.fieldContainerPadded}>
                      <Text className={styles.header}>TOKEN ID</Text>
                      <Text className={styles.value}>{tokenId}</Text>
                    </VStack>
                  </HStack>
                  <HStack w="100%" alignItems="flex-end">
                    <VStack className={styles.fieldContainerPadded}>
                      <Text className={styles.header}>CONTRACT ADDRESS</Text>
                      <Text className={styles.value}>
                        {abridgeAddress(collectionAddress as string)}
                      </Text>
                    </VStack>
                    <VStack className={styles.fieldContainerPadded}>
                      <Text className={styles.header}>NETWORK</Text>
                      <Text className={styles.value}>
                        {currentNetwork ? currentNetwork.name : "Goerli"}
                      </Text>
                    </VStack>
                  </HStack>
                  <Box h=".5rem" />
                  <HStack w="100%">
                    <Button onClick={transfer} className={styles.bridgeButton}>
                      {isLoading ? <Spinner color="white" /> : "BRIDGE TOKEN"}
                    </Button>
                    <Select
                      value={selectedNetwork}
                      className={styles.networkSelector}
                      onChange={(e) => setSelectedNetwork(e.target.value)}
                    >
                      {currentNetwork.id.toString() !== "5" && (
                        <option value="5">Goerli</option>
                      )}
                      {currentNetwork.id.toString() !== "80001" && (
                        <option value="80001">Polygon Mumbai</option>
                      )}
                      {currentNetwork.id.toString() !== "97" && (
                        <option value="97">BSC Testnet</option>
                      )}
                    </Select>
                  </HStack>
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </VStack>
      </VStack>
    </VStack>
  );
}

export default withTransition(Asset);
