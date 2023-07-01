import * as dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { Web3Storage } from "web3.storage";
import { MongoClient, ServerApiVersion } from "mongodb";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const app: Express = express();
const port = process.env.PORT ?? 8888;

const WEB3_STORAGE_API_KEY = process.env.WEB3_STORAGE_API_KEY ?? "";

const client = new Web3Storage({
  token: WEB3_STORAGE_API_KEY,
  endpoint: new URL("https://api.web3.storage"),
});

const mongoClient = new MongoClient(process.env.MONGO_URI ?? "", {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/collection/:id", async (req: Request, res: Response) => {
  try {
    await mongoClient.connect();

    const collections = await mongoClient
      .db("zetasis")
      .collection("collections");

    const { id } = req.params;

    const collection = await collections.findOne({ _id: id as any });

    res.status(200).send(collection);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Collection fetching failed" });
  }
});

app.get("/collection/:goerli", async (req: Request, res: Response) => {
  try {
    await mongoClient.connect();

    const collections = await mongoClient
      .db("zetasis")
      .collection("collections");

    const { goerli } = req.params;

    const collection = await collections.findOne({ goerli: goerli as any });

    res
      .status(200)
      .send({ message: "Collection fetched successfully", collection });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Collection fetching failed" });
  }
});

app.get("/collection/:polygon", async (req: Request, res: Response) => {
  try {
    await mongoClient.connect();

    const collections = await mongoClient
      .db("zetasis")
      .collection("collections");

    const { polygon } = req.params;

    const Collection = await collections.findOne({ polygon: polygon as any });

    res
      .status(200)
      .send({ message: "Collection fetched successfully", Collection });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Collection fetching failed" });
  }
});

app.post("/collection", async (req: Request, res: Response) => {
  try {
    await mongoClient.connect();

    const collections = mongoClient.db("zetasis").collection("collections");

    const collection = {
      _id: uuidv4(),
      goerli: req.body.goerli,
      polygon: req.body.polygon,
    };

    await collections.insertOne(collection as any);

    res.status(200).send({
      message: "Collection created successfully",
      collectionId: collection._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Collection creation failed" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
