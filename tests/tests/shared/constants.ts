import { Account, Contract, SequencerProvider } from "starknet";
import { loadContract } from "./lib";

// Polls quickly for a local network
class FastProvider extends SequencerProvider {
  waitForTransaction(txHash: string, options = {}) {
    return super.waitForTransaction(txHash, { retryInterval: 250, ...options });
  }
}

export const ESCAPE_SECURITY_PERIOD = 7n * 24n * 60n * 60n; // 7 days
export const ESCAPE_EXPIRY_PERIOD = 2n * 7n * 24n * 60n * 60n; // 14 days

export const baseUrl = "http://127.0.0.1:5050";
export const provider = new FastProvider({ baseUrl });

export const deployerAccount = new Account(
  provider /* provider */,
  "0x347be35996a21f6bf0623e75dbce52baba918ad5ae8d83b6f416045ab22961a" /* address */,
  "0xbdd640fb06671ad11c80317fa3b1799d" /* private key */,
);

export const ethAddress = "0x49D36570D4E46F48E99674BD3FCC84644DDD6B96F7C741B1562B82F9E004DC7";
let ethContract: Contract;

export async function getEthContract() {
  if (ethContract) {
    return ethContract;
  }
  ethContract = await loadContract(ethAddress);
  return ethContract;
}
