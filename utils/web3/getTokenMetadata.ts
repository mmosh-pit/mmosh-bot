import axios from "axios";

export async function getTokenMetadata(tokenAddress: string) {
  const response = await axios.post(
    process.env.SOLANA_CLUSTER!,
    {
      jsonrpc: "2.0",
      id: "text",
      method: "getAsset",
      params: {
        id: tokenAddress,
        options: {
          showFungible: true,
          showInscription: true,
          showCollectionMetadata: true,
        },
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
}
