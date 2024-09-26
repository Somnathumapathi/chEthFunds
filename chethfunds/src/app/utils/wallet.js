import {  useProvider, useSigner } from 'wagmi'

export async function getSigner(req) {
    try {
        const { data: signer } = useSigner()
        if (!signer) {
            throw new Error("No signer found. Make sure the wallet is connected.");
          }
          return signer;
        } catch (error) {
          console.error("Error getting signer:", error);
          throw new Error("Could not get signer from MetaMask");
        }
}

// export async function getProvider(req) {

// }