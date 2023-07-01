import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import {
  Button,
  HStack,
  Text,
  Image,
  Box,
  VStack,
  Spinner,
} from "@chakra-ui/react";
import Link from "next/link";
import withTransition from "@components/withTransition";
import { useAccount, useConnect } from "wagmi";

const Home: NextPage = () => {
  const { connector, isConnected, address } = useAccount();
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();

  return (
    <div className={styles.container}>
      {!address ? (
        <main className={styles.main}>
          <Text className={styles.title}>ZETASIS</Text>
          <HStack className={styles.subtitleContainer}>
            <Box className={styles.fadeLeft}></Box>
            <Text className={styles.subtitle}>
              EMPOWERING THE WEB3 CREATOR ECONOMY WITH ZETACHAIN EMPOWERING THE
              WEB3 CREATOR ECONOMY WITH ZETACHAIN EMPOWERING THE WEB3 CREATOR
              ECONOMY WITH ZETACHAIN
            </Text>
            <Box className={styles.fadeRight}></Box>
          </HStack>
          <Image alt="hero image" src="hero.png" className={styles.heroImage} />
          <Box h="5rem"></Box>
          <Button
            className={styles.connectButton}
            onClick={() => connect({ connector: connectors[0] })}
          >
            {isLoading ? <Spinner color="white" /> : "Connect Wallet"}
          </Button>
        </main>
      ) : (
        <main className={styles.main}>
          <HStack>
            <VStack className={styles.optionContainer}>
              <Image
                alt="token"
                src="/token.png"
                className={styles.tokenImage}
              ></Image>
              <Text className={styles.description}>
                Create your own NFT, a digital asset that represents ownership
                of a unique item or piece of content.
              </Text>

              <Link href="/create?type=token">
                <Button className={styles.button}>CREATE TOKEN</Button>
              </Link>
            </VStack>
            <Box className={styles.divider}></Box>
            <VStack className={styles.optionContainer}>
              <Image
                alt="collection"
                src="/collection.png"
                className={styles.collectionImage}
              ></Image>
              <Text className={styles.description}>
                Create your own NFT collection, an entire series of digital
                assets to share ownership with the world.
              </Text>
              <Link href="/create?type=collection">
                <Button className={styles.button}>CREATE COLLECTION</Button>
              </Link>
            </VStack>
          </HStack>
        </main>
      )}
    </div>
  );
};

export default withTransition(Home);
