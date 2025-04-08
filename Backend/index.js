const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
  const providerSepolia = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC);
  const providerBase = new ethers.JsonRpcProvider(process.env.BASE_RPC);

  const walletSepolia = new ethers.Wallet(
    process.env.PRIVATE_KEY,
    providerSepolia
  );
  const walletBase = new ethers.Wallet(process.env.PRIVATE_KEY, providerBase);

  const bridgeSepoliaAbi = require("./abis/BridgeSepolia.json").abi;
  const bridgeBaseAbi = require("./abis/BridgeBase.json").abi;

  const bridgeSepoliaAddress = process.env.BRIDGE_SEPOLIA;
  const bridgeBaseAddress = process.env.BRIDGE_BASE;

  const bridgeSepolia = new ethers.Contract(
    bridgeSepoliaAddress,
    bridgeSepoliaAbi,
    walletSepolia
  );
  const bridgeBase = new ethers.Contract(
    bridgeBaseAddress,
    bridgeBaseAbi,
    walletBase
  );

  // In-memory storage for pending operations.
  const pendingOps = {};

  // Listen for BridgeInitiated events on Sepolia.
  bridgeSepolia.on(
    "BridgeInitiated",
    async (user, convertedAmount, targetChain, opId) => {
      try {
        console.log(`Sepolia BridgeInitiated event:
  User: ${user}
  Converted Amount: ${convertedAmount.toString()}
  Target Chain: ${targetChain}
  OpId: ${opId}`);
        pendingOps[opId] = { chain: "sepolia" };
        console.log(`Calling mintTokens on Base for opId: ${opId}...`);
        const tx = await bridgeBase.mintTokens(user, convertedAmount, opId);
        await tx.wait();
        console.log(`Minted tokens on Base. Tx: ${tx.hash}`);
        delete pendingOps[opId];
      } catch (error) {
        console.error("Error finalizing on Base:", error);
      }
    }
  );

  // Listen for BridgeInitiated events on Base (for reverse bridging).
  bridgeBase.on("BridgeInitiated", async (user, amount, targetChain, opId) => {
    try {
      console.log(`Base BridgeInitiated event:
  User: ${user}
  Amount: ${amount.toString()}
  Target Chain: ${targetChain}
  OpId: ${opId}`);
      pendingOps[opId] = { chain: "base" };
      console.log(`Calling releaseTokens on Sepolia for opId: ${opId}...`);
      const tx = await bridgeSepolia.releaseTokens(user, amount, opId);
      await tx.wait();
      console.log(`Released tokens on Sepolia. Tx: ${tx.hash}`);
      delete pendingOps[opId];
    } catch (error) {
      console.error("Error finalizing on Sepolia:", error);
    }
  });

  // Listen for BridgeFinalized events on both chains to remove finalized operations.
  bridgeSepolia.on("BridgeFinalized", (user, amount, opId) => {
    console.log(`Sepolia BridgeFinalized event for opId: ${opId}`);
    delete pendingOps[opId];
  });
  bridgeBase.on("BridgeFinalized", (user, amount, opId) => {
    console.log(`Base BridgeFinalized event for opId: ${opId}`);
    delete pendingOps[opId];
  });

  // Poll every 60 seconds to check for expired (unfinalized) operations and trigger refunds.
  setInterval(async () => {
    console.log("Polling pending operations for refund eligibility...");
    for (const opId in pendingOps) {
      try {
        const op = await bridgeSepolia.bridgeOperations(opId);
        const opTimestamp = Number(op.timestamp);
        const currentTime = Math.floor(Date.now() / 1000);
        if (
          !op.finalized &&
          currentTime >= opTimestamp + Number(process.env.REFUND_TIME || 86400)
        ) {
          console.log(
            `Attempting refund for opId: ${opId} (timestamp: ${opTimestamp}, currentTime: ${currentTime})`
          );
          const tx = await bridgeSepolia.refund(opId);
          await tx.wait();
          console.log(`Refund succeeded for opId: ${opId}. Tx: ${tx.hash}`);
          delete pendingOps[opId];
        }
      } catch (e) {
        console.error(`Error processing refund for opId ${opId}:`, e);
      }
    }
  }, 60000);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
