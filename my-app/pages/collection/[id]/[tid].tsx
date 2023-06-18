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
} from "@chakra-ui/react";
import withTransition from "@components/withTransition";
import styles from "@styles/Token.module.css";
import { abridgeAddress } from "@utils/abridgeAddress";
import Link from "next/link";
import { useRouter } from "next/router";

function Asset() {
  const router = useRouter();
  const { tid } = router.query;

  if (tid == "1") {
    return (
      <VStack className={styles.main}>
        <VStack className={styles.tokenContainer}>
          <Image
            alt="mantle token"
            src="/mantle.jpg"
            className={styles.image}
          ></Image>
          <VStack className={styles.tokenDetailContainer}>
            <HStack w="100%" justifyContent="space-between">
              <Text className={styles.name}>Mantle Network NFT</Text>
              <HStack>
                <ChakraLink
                  href="https://explorer.testnet.mantle.xyz/token/0xb499bc2ad48b86fd4aa9c94e081c213edfd4bdf2/instance/1/token-transfers"
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
                <ChakraLink href="https://www.mantle.xyz/" isExternal>
                  <Image
                    alt="web"
                    src="/website.png"
                    className={styles.webIcon}
                  ></Image>
                </ChakraLink>
              </HStack>
            </HStack>
            <Text className={styles.description}>
              Mantle is a high-performance Ethereum layer-2 network built with
              modular architecture delivering low fees and high security.
            </Text>
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
                        {abridgeAddress(
                          "0xB8E93eF7B186A090d15fe4fb3F76A0E1d643b86A"
                        )}
                      </Text>
                    </VStack>

                    <Text className={styles.header}>View details</Text>
                  </HStack>
                </AccordionButton>
                <AccordionPanel>
                  {
                    <VStack w="100%">
                      <HStack
                        w="100%"
                        justifyContent="center"
                        p="20px 0 10px 0"
                      >
                        <Box className={styles.divider}></Box>
                      </HStack>
                      <HStack w="100%" alignItems="flex-end">
                        <VStack className={styles.fieldContainerPadded}>
                          <Text className={styles.header}>COLLECTION</Text>
                          <Link href="/collection/1">
                            <Text className={styles.value}>
                              Silicate Collection 1
                            </Text>
                          </Link>
                        </VStack>
                        <VStack className={styles.fieldContainerPadded}>
                          <Text className={styles.header}>TOKEN ID</Text>
                          <Text className={styles.value}>34</Text>
                        </VStack>
                      </HStack>
                      <HStack w="100%" alignItems="flex-end">
                        <VStack className={styles.fieldContainerPadded}>
                          <Text className={styles.header}>
                            CONTRACT ADDRESS
                          </Text>
                          <Text className={styles.value}>
                            {" "}
                            {abridgeAddress(
                              "0xB499Bc2AD48b86fd4AA9C94e081C213eDFD4bDf2"
                            )}
                          </Text>
                        </VStack>
                        <VStack className={styles.fieldContainerPadded}>
                          <Text className={styles.header}>
                            CREATOR ROYALTIES
                          </Text>
                          <Text className={styles.value}>5%</Text>
                        </VStack>
                      </HStack>
                    </VStack>
                  }
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </VStack>
        </VStack>
      </VStack>
    );
  } else {
    return (
      <VStack className={styles.main}>
        <VStack className={styles.tokenContainer}>
          <Image
            alt="mantle token"
            src="/azuki/1.png"
            className={styles.image}
          ></Image>
          <VStack className={styles.tokenDetailContainer}>
            <HStack w="100%" justifyContent="space-between">
              <Text className={styles.name}>Azuki #9605</Text>
              <HStack>
                <ChakraLink
                  href="https://explorer.testnet.mantle.xyz/token/0xb499bc2ad48b86fd4aa9c94e081c213edfd4bdf2/instance/1/token-transfers"
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
                <ChakraLink href="https://www.mantle.xyz/" isExternal>
                  <Image
                    alt="web"
                    src="/website.png"
                    className={styles.webIcon}
                  ></Image>
                </ChakraLink>
              </HStack>
            </HStack>
            <Text className={styles.description}>
              We rise together. We build together. We grow together.
            </Text>
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
                        {abridgeAddress(
                          "0xB8E93eF7B186A090d15fe4fb3F76A0E1d643b86A"
                        )}
                      </Text>
                    </VStack>

                    <Text className={styles.header}>View details</Text>
                  </HStack>
                </AccordionButton>
                <AccordionPanel>
                  {
                    <VStack w="100%">
                      <HStack
                        w="100%"
                        justifyContent="center"
                        p="20px 0 10px 0"
                      >
                        <Box className={styles.divider}></Box>
                      </HStack>
                      <HStack w="100%" alignItems="flex-end">
                        <VStack className={styles.fieldContainerPadded}>
                          <Text className={styles.header}>COLLECTION</Text>
                          <Link href="/collection/1">
                            <Text className={styles.value}>
                              AZUKI (Mantle Edition)
                            </Text>
                          </Link>
                        </VStack>
                        <VStack className={styles.fieldContainerPadded}>
                          <Text className={styles.header}>TOKEN ID</Text>
                          <Text className={styles.value}>34</Text>
                        </VStack>
                      </HStack>
                      <HStack w="100%" alignItems="flex-end">
                        <VStack className={styles.fieldContainerPadded}>
                          <Text className={styles.header}>
                            CONTRACT ADDRESS
                          </Text>
                          <Text className={styles.value}>
                            {" "}
                            {abridgeAddress(
                              "0xB499Bc2AD48b86fd4AA9C94e081C213eDFD4bDf2"
                            )}
                          </Text>
                        </VStack>
                        <VStack className={styles.fieldContainerPadded}>
                          <Text className={styles.header}>
                            CREATOR ROYALTIES
                          </Text>
                          <Text className={styles.value}>5%</Text>
                        </VStack>
                      </HStack>
                    </VStack>
                  }
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </VStack>
        </VStack>
      </VStack>
    );
  }
}

export default withTransition(Asset);
