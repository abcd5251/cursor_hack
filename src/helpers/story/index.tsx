"use server";

import { http, stringToBytes } from "viem";
import { Account, privateKeyToAccount } from "viem/accounts";
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";

const privateKey = stringToBytes(
  process.env.WALLET_PRIVATE_KEY?.startsWith("0x")
    ? process.env.WALLET_PRIVATE_KEY
    : (`0x${process.env.WALLET_PRIVATE_KEY}` as string)
);

const account: Account = privateKeyToAccount(
  `0x${Buffer.from(privateKey).toString("hex")}`
);

const storyConfig: StoryConfig = {
  account: account, // the account object from above
  transport: http(process.env.RPC_PROVIDER_URL),
  chainId: "odyssey",
};

export const client = StoryClient.newClient(storyConfig);
