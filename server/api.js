const express = require("express");
require("dotenv").config();
const app = express();
const port = 8888;

const db = require("./firebase.js");
const {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
} = require("firebase/firestore");

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/", function (req, res) {
  res.send("Hello World");
});

app.get("/price/:symbol", async function (req, res) {
  const { symbol } = req.params;

  const response = await fetch(
    `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol}&CMC_PRO_API_KEY=${process.env.CMC_API_KEY}&convert=USD`
  );

  const data = await response.json();

  const price = data.data[symbol].quote["USD"].price;

  res.send({ price: price });
});

app.get("/assets/:address", function (req, res) {
  res.send({
    assets: [
      {
        name: "Kirby",
        description:
          "Kirby is a small, pink, spherical creature who has the ability to inhale objects and creatures to gain their powers. He is often called upon to save his home world of Dream Land from various villains.",
        collection: "Nexus Protocol Collection 3",
        image_url:
          "https://bafybeie6rfxujzadhx5t3ofso6sckg33jknl5vhobmgby7uetpmbzaojvm.ipfs.w3s.link/preview.png",
        animation_url:
          "https://bafybeicegfiiccusrwdyn3yut5temunjejordfmktyedjkumafwmd3ixpa.ipfs.w3s.link/kirby.glb",
        model_url:
          "https://bafybeicegfiiccusrwdyn3yut5temunjejordfmktyedjkumafwmd3ixpa.ipfs.w3s.link/kirby.glb",
        properties: [
          {
            trait_type: "Background",
            value: "Pink",
          },
        ],
      },
      {
        contract_address: "0x503cb51f9b781a3f1548e1a838d606550d596e6f",
        token_id: 291,
        name: "SF Light - Fighter 291",
        description: null,
        external_link: null,
        image_url: null,
        animation_url: null,
        model_url: null,
        properties: [],
      },
      {
        contract_address: "0x9270f32d0e7e50211b068ebfb17e425f8ddbb100",
        token_id: 9394,
        name: "Ultra Motorbikes - 9394",
        description: null,
        external_link: null,
        image_url: null,
        animation_url: null,
        model_url: null,
        properties: [],
      },
      {
        contract_address: "0x503cb51f9b781a3f1548e1a838d606550d596e6f",
        token_id: 291,
        name: "Star Wars - X Wing Starfighter 3",
        description: null,
        external_link: null,
        image_url: null,
        animation_url: null,
        model_url: null,
        properties: [],
      },
    ],
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
