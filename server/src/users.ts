import express, { Request, Response } from "express";
import db from "../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export const users = express.Router();

users.get("/:address", async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    const docRef = doc(db, "users", address);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      res.status(200).send(docSnap.data());
    } else {
      res.status(404).send({ message: "User not found" });
    }
    return;
  } catch (e) {
    console.log(e);
    res.status(500).send("Request failed");
  }
});

users.get("/:address/assets", async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    const docRef = doc(db, "users", address);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data: any = docSnap.data();
      const assets = Object.values(data.assets);

      res.status(200).send(assets);
    } else {
      res.status(404).send({ message: "User not found" });
    }
    return;
  } catch (e) {
    console.log(e);
    res.status(500).send("Request failed");
  }
});

users.post("/create", async (req: Request, res: Response) => {
  try {
    const { address } = req.body;

    const docRef = doc(db, "users", address);
    await setDoc(docRef, {
      address: address,
      createdAt: new Date().toLocaleDateString(),
      assets: {},
    });
    res.status(200).send("Success");
  } catch (e) {
    console.log(e);
    res.status(500).send("Request failed");
  }
});

users.post("/ownership", async (req: Request, res: Response) => {
  try {
    const { address, tokenId, metadata, buyerAddress, sellerAddress } =
      req.body;
    const uuid = `${address.substring(0, 10)}+${tokenId}`;

    const buyerDocRef = doc(db, "users", buyerAddress);
    const buyerDocSnap = await getDoc(buyerDocRef);

    if (buyerDocSnap.exists()) {
      const { assets } = buyerDocSnap.data();

      const newAssets = JSON.parse(JSON.stringify(assets));
      newAssets[uuid] = {
        address,
        tokenId,
        metadata,
      };

      await updateDoc(buyerDocRef, {
        assets: newAssets,
      });
    }

    const sellerDocRef = doc(db, "users", sellerAddress);
    const sellerDocSnap = await getDoc(sellerDocRef);

    if (sellerDocSnap.exists()) {
      const { assets } = sellerDocSnap.data();

      const newAssets = JSON.parse(JSON.stringify(assets));

      delete newAssets[uuid];

      await updateDoc(sellerDocRef, {
        assets: newAssets,
      });
    }

    res.status(200).send("Success");
  } catch (e) {
    console.log(e);
    res.status(500).send("Request failed");
  }
});
