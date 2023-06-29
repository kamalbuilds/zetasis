export type CollectionMetadata = {
  name: string;
  description: string;
  symbol: string;
  image: string;
  base_uri: string;
  seller_fee_basis_points: string;
  fee_recipient: string;
};

export type TokenMetadata = {
  name: string;
  description: string;
  collection: string;
  external_url: string;
  image: string;
  attributes: Attribute[];
};

export type Attribute = {
  trait_type: string;
  value: string;
};
