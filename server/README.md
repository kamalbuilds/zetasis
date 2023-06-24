# silicate Protocol API V1

`GET https://silicate-server-kt42.onrender.com/users/:address/assets`

This endpoint returns a set of assets based on the specified user Aurora address.

Sample request: [/users/0x6B4583438C24839ea459e34e9F21aD419A846B0b/assets](https://silicate-server-kt42.onrender.com/users/0x6B4583438C24839ea459e34e9F21aD419A846B0b/assets)

The endpoint will return the following fields:

| Field Name |      Description      |
| :--------: | :-------------------: |
|   assets   | List of Asset Objects |

An `asset` is defined by the following fields:

|    Field Name    |                   Description                   |
| :--------------: | :---------------------------------------------: |
| contract_address |            Address of NFT Collection            |
|     token_id     |                Token ID of asset                |
|       name       |                  Name of asset                  |
|   description    |              Description of asset               |
|  external_link   |            External link to website             |
|    image_url     |         URL hosting asset preview image         |
|    properties    |           Attributes describing asset           |

Example JSON blob:

```
{
  name: "Kirby",
  description: "Kirby is a small, pink, spherical creature who has the ability to inhale objects and creatures to gain their powers. He is often called upon to save his home world of Dream Land from various villains.",
  collection: "silicate Protocol Collection 3",
  image_url: "https://bafybeie6rfxujzadhx5t3ofso6sckg33jknl5vhobmgby7uetpmbzaojvm.ipfs.w3s.link/preview.png",
  attributes: [
    {
      "trait_type": "Background",
      "value": "Pink"
    }
  ]
}
```

## Future Roadmap for API

The following endpoints are planning to be added as a follow-up:

- Retrieve collections
- Retrieve bundles
- Retrieve a contract
- Retrieve a collection
- Retrieve collection states
- Mint batched assets
