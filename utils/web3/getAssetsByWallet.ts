import axios from "axios";

export async function getAssetsByWallet(wallet: string, fungible: boolean) {
  const response = await axios.post(
    process.env.SOLANA_CLUSTER!,
    {
      jsonrpc: "2.0",
      id: "text",
      method: "getAssetsByOwner",
      params: {
        ownerAddress: wallet,
        displayOptions: {
          showFungible: fungible,
          showInscription: fungible,
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
