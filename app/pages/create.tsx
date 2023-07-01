import CreateCollection from "@components/CreateCollection";
import CreateToken from "@components/CreateToken";
import withTransition from "@components/withTransition";
import { useRouter } from "next/router";

function Create() {
  const router = useRouter();
  const { type } = router.query;

  if (type === "token") {
    return <CreateToken />;
  } else {
    return <CreateCollection />;
  }
}

export default withTransition(Create);
