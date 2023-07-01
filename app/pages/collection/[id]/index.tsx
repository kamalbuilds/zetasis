import {
  HStack,
  VStack,
  Text,
  Image,
  SimpleGrid,
  Link as ChakraLink,
  Spinner,
  Button,
  Select,
} from "@chakra-ui/react";
import axios from "axios";
import withTransition from "@components/withTransition";
import styles from "@styles/Collection.module.css";
import { abridgeAddress } from "@utils/abridgeAddress";
import { useAccount, useNetwork, useSigner, useSwitchNetwork } from "wagmi";
import NewNFT from "@data/NewNFT.json";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SuccessLottie from "@components/SuccessLottie";
import { ethers } from "ethers";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function Collection() {
  const router = useRouter();
  const { address } = useAccount();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [tokens, setTokens] = useState<any[]>([]);

  const { data: signer, isError } = useSigner();

  const { chain: currentNetwork } = useNetwork();
  const [selectedNetwork, setSelectedNetwork] = useState<string>(
    currentNetwork ? currentNetwork.id.toString() : "5"
  );
  const {
    chains,
    error,
    isLoading: isNetworkLoading,
    switchNetwork,
  } = useSwitchNetwork();
  const [txnHash, setTxnHash] = useState("");

  const [goerliContractAddress, setGoerliContractAddress] =
    useState<string>("");
  const [goerliBaseURI, setGoerliBaseURI] = useState("");
  const [goerliMetadata, setGoerliMetadata] = useState();
  const [goerliTokens, setGoerliTokens] = useState([]);
  const [goerliLastTokenId, setGoerliLastTokenId] = useState(0);

  const [polygonContractAddress, setPolygonContractAddress] =
    useState<string>("");
  const [polygonBaseURI, setPolygonBaseURI] = useState("");
  const [polygonMetadata, setPolygonMetadata] = useState();
  const [polygonTokens, setPolygonTokens] = useState([]);
  const [polygonLastTokenId, setPolygonLastTokenId] = useState(0);

  const { id } = router.query;

  const { NFT_ADDRESS, EXPLORER_URI } = useMemo(() => {
    let NFT_ADDRESS;
    let EXPLORER_URI;

    switch (currentNetwork.id) {
      case 5:
        NFT_ADDRESS = goerliContractAddress;
        EXPLORER_URI = "https://goerli.etherscan.io/tx/";
        break;
      case 80001:
        NFT_ADDRESS = polygonContractAddress;
        EXPLORER_URI = "https://mumbai.polygonscan.com/tx/";
        break;
      default:
        NFT_ADDRESS =
          process.env.NEXT_PUBLIC_ZETASIS_ADDRESS ??
          "0x0e2ab2707482d6cfe2dc006f2ee4442aa1377d3f";
        EXPLORER_URI = "https://explorer.athens.zetachain.com/cc/tx/";
        break;
    }

    return { NFT_ADDRESS, EXPLORER_URI };
  }, [currentNetwork.id, goerliContractAddress, polygonContractAddress]);

  // MINTING
  const mint = useCallback(async () => {
    setLoading(true);
    try {
      const contract = new ethers.Contract(NFT_ADDRESS, NewNFT.abi, signer);
      const nftResult = await contract.mint();
      setTxnHash(nftResult.hash);
      return nftResult;
    } catch (e) {
      console.log(e);
    }
  }, [NFT_ADDRESS, signer]);

  const fetchCollection = useCallback(async () => {
    if (id) {
      try {
        const res = await axios.get(`${API_URL}/collection/${id}`);

        if (!res.data) return;

        const { goerli, polygon } = res.data;

        setGoerliContractAddress(goerli);
        setPolygonContractAddress(polygon);

        const goerliProvider = new ethers.providers.JsonRpcProvider(
          "https://ethereum-goerli.publicnode.com"
        );
        const polygonProvider = new ethers.providers.JsonRpcProvider(
          "https://rpc-mumbai.maticvigil.com"
        );

        const goerliContract = new ethers.Contract(
          goerli,
          NewNFT.abi,
          goerliProvider
        );

        const polygonContract = new ethers.Contract(
          polygon,
          NewNFT.abi,
          polygonProvider
        );

        const goerliContractURI = await goerliContract.contractURI();
        const goerliBaseURI = await goerliContract.getBaseURI();
        const goerliLastTokenId = await goerliContract.getLastTokenId();
        const polygonContractURI = await polygonContract.contractURI();
        const polygonBaseURI = await polygonContract.getBaseURI();
        const polygonLastTokenId = await polygonContract.getLastTokenId();

        setGoerliBaseURI(goerliBaseURI);
        setPolygonBaseURI(polygonBaseURI);

        setGoerliLastTokenId(goerliLastTokenId);
        setPolygonLastTokenId(polygonLastTokenId);

        if (!goerliContractURI || !polygonContractURI) return;

        const goerliRes = await fetch(goerliContractURI as string);
        const goerliResult = await goerliRes.json();
        setGoerliMetadata(goerliResult);

        const polygonRes = await fetch(polygonContractURI as string);
        const polygonResult = await polygonRes.json();
        setPolygonMetadata(polygonResult);

        const fetchedGoerliTokens = [];

        for (let i = 1; i <= goerliLastTokenId; i++) {
          const response = await fetch(`${goerliBaseURI}/${i}` as string);
          const result = await response.json();
          fetchedGoerliTokens.push(result);
        }

        setGoerliTokens(fetchedGoerliTokens);

        const fetchedPolygonTokens = [];

        for (let i = 1; i <= polygonLastTokenId; i++) {
          const response = await fetch(`${polygonBaseURI}/${i}` as string);
          const result = await response.json();
          fetchedPolygonTokens.push(result);
        }

        setPolygonTokens(fetchedPolygonTokens);
      } catch (err) {
        console.error(err);
      }
    }
  }, [id]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection, id]);

  const navigationLink = useMemo(
    () =>
      goerliLastTokenId
        ? `/collection/${goerliContractAddress}/${
            parseInt(goerliLastTokenId as string, 10) + 1
          }`
        : `/collection/${goerliContractAddress}`,
    [goerliContractAddress, goerliLastTokenId]
  );

  if (!goerliMetadata)
    return (
      <HStack className={styles.main} h="100vh">
        <HStack alignItems="center" h="70vh">
          <Spinner color="white" size="xl" />
        </HStack>
      </HStack>
    );

  if (txnHash) {
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
                txnHash
                  ? `https://goerli.etherscan.io/tx/${txnHash}`
                  : "https://goerli.etherscan.io"
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
            alt="zetasis collection"
            src={goerliMetadata.image}
            className={styles.collectionCover}
          ></Image>
          <Text className={styles.owner}></Text>
          <Text className={styles.description}>
            {goerliMetadata.description}
          </Text>
          <HStack gap={1}>
            <ChakraLink
              href={`https://explorer.athens.zetachain.com/address/${goerliContractAddress}`}
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
                (goerliBaseURI as string) ??
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
            <ChakraLink href="https://www.zetasis.dev/" isExternal>
              <Image
                alt="web"
                src="/website.png"
                className={styles.webIcon}
              ></Image>
            </ChakraLink>
          </HStack>
        </VStack>
        <VStack w="100%">
          <HStack w="100%">
            <Button onClick={mint} className={styles.mintButton}>
              {isLoading ? <Spinner color="white" /> : "MINT"}
            </Button>
            <Select
              value={currentNetwork ? currentNetwork.id : "5"}
              className={styles.networkSelector}
              onChange={(e) => {
                const selectedChainId = Number(e.target.value);
                if (selectedChainId !== currentNetwork.id) {
                  switchNetwork(selectedChainId);
                }
              }}
            >
              <option value="5">Goerli</option>
              <option value="80001">Polygon Mumbai</option>
              {/* <option value="97">BSC Testnet</option> */}
            </Select>
          </HStack>
          <Text className={styles.mintLabel}>{`${1}/10000 Minted`}</Text>
        </VStack>
      </VStack>
      <VStack className={styles.gridContainer}>
        {goerliLastTokenId == 0 ? (
          <VStack height="70vh" justifyContent="center">
            <Text>No tokens minted yet</Text>
          </VStack>
        ) : (
          <SimpleGrid columns={4} w="100%" gap={3}>
            {[...goerliTokens, ...polygonTokens].map(({ image, name }, idx) => (
              <Link
                href={`/collection/${goerliContractAddress}/${idx + 1}`}
                key={idx}
              >
                <VStack className={styles.tokenCardContainer}>
                  <VStack className={styles.tokenImageContainer}>
                    <Image
                      alt={name}
                      src={`https:ipfs.io/ipfs/${image.split("//")[1]}`}
                      className={styles.tokenImage}
                    ></Image>
                    <Image
                      alt="token image"
                      src="/goerli.png"
                      className={styles.networkIcon}
                    ></Image>
                  </VStack>
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

export default withTransition(Collection);
