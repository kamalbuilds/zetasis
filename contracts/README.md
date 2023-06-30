# Silicate Tutorial: How to create your own NFT Metadata

You can learn all about creating your own NFT metadata base URI here. A Base URI is simply a URI that points to where your NFT collection's entire token metadata map is stored. See the following example to better understand what the JSON object looks like:

## Sample Base URI

`Azuki NFT Collection` on IPFS: [`https://ipfs.io/ipfs/QmZcH4YvBVVRJtdn4RdbaqgspFU8gH6P9vomDpBVpAL3u4/`](https://ipfs.io/ipfs/QmZcH4YvBVVRJtdn4RdbaqgspFU8gH6P9vomDpBVpAL3u4/)

![ipfs](/contracts/ipfs.png)

## Opensea Metadata Standard

Each individual token metadata should follow the Opensea Metadata Standard as it is the most widely adopted in the industry. Read more about it here: https://docs.opensea.io/docs/metadata-standards
```JSON
{
    "name": "Azuki #2082",
    "image": "ipfs://QmYDvPAXtiJg7s8JdRBSLWdgSphQdac8j1YuQNNxcGE1hg/2082.png",
    "attributes": [
        {
        "trait_type": "Type",
        "value": "Human"
        },
        {
        "trait_type": "Hair",
        "value": "Green Half Bun"
        },
        {
        "trait_type": "Clothing",
        "value": "White Hoodie"
        },
        {
        "trait_type": "Eyes",
        "value": "Relaxed"
        },
        {
        "trait_type": "Mouth",
        "value": "Grin"
        },
        {
        "trait_type": "Background",
        "value": "Off White B"
        }
    ]
}
```

There's also contract-level metadata to define attributes for a collection, as opposed to a single token. The contract metadata may look like this:

```JSON
{
  "name": "OpenSea Creatures",
  "description": "OpenSea Creatures are adorable aquatic beings primarily for demonstrating what can be done using the OpenSea platform. Adopt one today to try out all the OpenSea buying, selling, and bidding feature set.",
  "image": "external-link-url/image.png",
  "external_link": "external-link-url",
  "seller_fee_basis_points": 100, # Indicates a 1% seller fee.
  "fee_recipient": "0xA97F337c39cccE66adfeCB2BF99C1DdC54C2D721" # Where seller fees will be paid to.
}
```

Read more here: https://docs.opensea.io/docs/contract-level-metadata