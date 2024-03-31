import axios from "axios";

export async function getTokenMetadata(tokenAddress: string) {
  const response = await axios.post(
    "https://api.helius.xyz/v0/token-metadata?api-key=e28687eb-0946-4d1b-9205-31804b14cf39",
    {
      mintAccounts: [tokenAddress],
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
}
