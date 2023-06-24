import express, { Request, Response } from "express";
import db from "../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";

export const assets = express.Router();

export function getTimestamp() {
  const options: any = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  };
  return new Date().toLocaleString("en-us", options);
}

assets.get("/", async (req: Request, res: Response) => {
  try {
    const query = collection(db, "assets");
    const querySnap: any = await getDocs(query);

    const fetchedAssets: any = [];

    if (querySnap) {
      querySnap.forEach((doc: any) => {
        fetchedAssets.push(doc.data());
      });
      res.status(200).send({ message: "Success", assets: fetchedAssets });
    } else {
      res.status(404).send({ message: "Assets not found" });
    }
    return;
  } catch (e) {
    console.log(e);
    res.status(500).send("Request failed");
  }
});

assets.get("/:address/:tokenId", async (req: Request, res: Response) => {
  try {
    const { address, tokenId } = req.params;

    const uuid = `${address.substring(0, 10)}+${tokenId}`;

    const docRef = doc(db, "assets", uuid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      res.status(200).send(docSnap.data());
    } else {
      res.status(404).send({ message: "Asset not found" });
    }
    return;
  } catch (e) {
    console.log(e);
    res.status(500).send("Request failed");
  }
});

assets.post("/create", async (req: Request, res: Response) => {
  try {
    const { address, tokenId, metadata, userAddress } = req.body;
    const uuid = `${address.substring(0, 10)}+${tokenId}`;
    const docRef = doc(db, "assets", uuid);

    const userDocRef = doc(db, "users", userAddress);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const { assets } = docSnap.data();

      const newAssets = JSON.parse(JSON.stringify(assets));
      newAssets[uuid] = {
        address,
        tokenId,
        metadata,
      };

      await updateDoc(userDocRef, {
        assets: newAssets,
      });
    }

    const timestamp = getTimestamp();

    const event = {
      address: userAddress,
      title: "created this asset",
      subtitle: timestamp,
    };

    const history = { 0: event };

    await setDoc(docRef, {
      address,
      tokenId,
      metadata,
      history,
    });

    res.status(200).send("Success");
  } catch (e) {
    console.log(e);
    res.status(500).send("Request failed");
  }
});
