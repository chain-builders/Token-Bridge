const { ethers } = require("ethers");
require("dotenv").config({path: '.env.local'});

const providerSepolia = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC);
const providerBase = new ethers.JsonRpcProvider(process.env.BASE_RPC);

const walletSepolia = new ethers.Wallet(
  process.env.PRIVATE_KEY,
  providerSepolia
);
const walletBase = new ethers.Wallet(process.env.PRIVATE_KEY, providerBase);

const bridgeSepoliaAbi = require("./abis/BridgeSepolia.json").abi;
const bridgeBaseAbi = require("./abis/BridgeBase.json").abi;

const bridgeSepolia = new ethers.Contract(
  process.env.BRIDGE_SEPOLIA,
  bridgeSepoliaAbi,
  walletSepolia
);

const bridgeBase = new ethers.Contract(
  process.env.BRIDGE_BASE,
  bridgeBaseAbi,
  walletBase
);

// In-memory pending tracker
const pendingOps = {};
async function main() {

  // === Listen Sepolia → Base ===
  bridgeSepolia.on(
    "BridgeInitiated",
    async (user, amount, targetChain, opId) => {
      try {
        console.log(`📡 Sepolia → Base Initiated
- User: ${user}
- Amount: ${ethers.formatEther(amount)} MTK
- opId: ${opId}`);

        pendingOps[opId] = "sepolia";
        const tx = await bridgeBase.mintTokens(user, amount, opId);
        await tx.wait();
        console.log(`✅ Minted on Base: ${tx.hash}`);
      } catch (err) {
        console.error(
          `❌ Error bridging to Base for opId ${opId}:`,
          err.reason || err
        );
      }
    }
  );

  // === Listen Base → Sepolia ===
  bridgeBase.on("BridgeInitiated", async (user, amount, targetChain, opId) => {
    try {
      console.log(`📡 Base → Sepolia Initiated
- User: ${user}
- Amount: ${ethers.formatEther(amount)} MTK
- opId: ${opId}`);

      pendingOps[opId] = "base";
      const tx = await bridgeSepolia.releaseTokens(user, amount, opId);
      await tx.wait();
      console.log(`✅ Released on Sepolia: ${tx.hash}`);
    } catch (err) {
      console.error(
        `❌ Error bridging to Sepolia for opId ${opId}:`,
        err.reason || err
      );
    }
  });

  // === Finalization listeners ===
  bridgeSepolia.on("BridgeFinalized", (user, amount, opId) => {
    console.log(`🧾 Finalized on Sepolia: ${opId}`);
    delete pendingOps[opId];
  });

  bridgeBase.on("BridgeFinalized", (user, amount, opId) => {
    console.log(`🧾 Finalized on Base: ${opId}`);
    delete pendingOps[opId];
  });

  // === Optional refund polling ===
  // You can uncomment and implement refund logic later
  // setInterval(async () => {
  //   console.log("⏳ Checking for refundable ops...");
  //   for (const opId in pendingOps) {
  //     try {
  //       const op = await bridgeSepolia.bridgeOperations(opId);
  //       const age = Math.floor(Date.now() / 1000) - Number(op.timestamp);
  //       if (!op.finalized && age > 86400) {
  //         const tx = await bridgeSepolia.refund(opId);
  //         await tx.wait();
  //         console.log(`💸 Refunded opId ${opId}`);
  //         delete pendingOps[opId];
  //       }
  //     } catch (err) {
  //       console.error(`Refund check failed for opId ${opId}:`, err);
  //     }
  //   }
  // }, 60000);
}

main()
  .then(() => console.log("🚀 Relayer running..."))
  .catch((error) => {
    console.error("💥 Fatal relayer error:", error);
    process.exit(1);
  });
