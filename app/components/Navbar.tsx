import Link from "next/link";
import styles from "@styles/Navbar.module.css";
import { Button, HStack, Image, Spinner, Text } from "@chakra-ui/react";
import { useAccount, useDisconnect } from "wagmi";
import { abridgeAddress } from "@utils/abridgeAddress";
import { useState } from "react";
import { useRouter } from "next/router";

const Navbar = () => {
  const router = useRouter();
  const { address } = useAccount();
  const { disconnect, isLoading } = useDisconnect();

  const [isHover, setIsHover] = useState<boolean>(false);

  function handleDisconnect() {
    disconnect();
    router.push("/");
    setIsHover(false);
  }

  return (
    <HStack className={styles.navbar}>
      <Link href="/">
        <Image
          src="/logo.png"
          alt="Logo"
          cursor="pointer"
          className={styles.logo}
        ></Image>
      </Link>

      {address && (
        <Button
          className={styles.button}
          onClick={handleDisconnect}
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
        >
          {isLoading ? (
            <Spinner color="white" />
          ) : isHover ? (
            "DISCONNECT"
          ) : (
            abridgeAddress(address)
          )}
        </Button>
      )}
    </HStack>
  );
};

export default Navbar;
