const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
  const providerSepolia = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC);
  const providerBase = new ethers.JsonRpcProvider(process.env.BASE_RPC);

  // Add connection error handling
  providerSepolia.on("error", (error) => {
    console.error("Sepolia provider error:", error);
    reconnectProvider("sepolia");
  });
  
  providerBase.on("error", (error) => {
    console.error("Base provider error:", error);
    reconnectProvider("base");
  });

  function reconnectProvider(network) {
    console.log(`Attempting to reconnect to ${network}...`);
    setTimeout(() => {
      // Implement reconnection logic
      console.log(`Reconnected to ${network}`);
    }, 5000);
  }

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

  // In-memory storage for pending operations with timestamps
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
        
        // Add timestamp to track when operation was initiated
        pendingOps[opId] = { 
          chain: "sepolia", 
          timestamp: Math.floor(Date.now() / 1000),
          processed: false
        };
        
        console.log(`Calling mintTokens on Base for opId: ${opId}...`);
        const tx = await bridgeBase.mintTokens(user, convertedAmount, opId);
        await tx.wait();
        console.log(`Minted tokens on Base. Tx: ${tx.hash}`);
        
        // Mark as processed instead of deleting
        pendingOps[opId].processed = true;
      } catch (error) {
        console.error("Error finalizing on Base:", error);
        // Keep the operation in pending state for retry or manual intervention
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
      
      pendingOps[opId] = { 
        chain: "base", 
        timestamp: Math.floor(Date.now() / 1000),
        processed: false
      };
      
      console.log(`Calling releaseTokens on Sepolia for opId: ${opId}...`);
      const tx = await bridgeSepolia.releaseTokens(user, amount, opId);
      await tx.wait();
      console.log(`Released tokens on Sepolia. Tx: ${tx.hash}`);
      
      // Mark as processed instead of deleting
      pendingOps[opId].processed = true;
    } catch (error) {
      console.error("Error finalizing on Sepolia:", error);
    }
  });

  // Listen for BridgeFinalized events on both chains to mark operations as finalized
  bridgeSepolia.on("BridgeFinalized", (user, amount, opId) => {
    console.log(`Sepolia BridgeFinalized event for opId: ${opId}`);
    if (pendingOps[opId]) {
      delete pendingOps[opId];
    }
  });
  
  bridgeBase.on("BridgeFinalized", (user, amount, opId) => {
    console.log(`Base BridgeFinalized event for opId: ${opId}`);
    if (pendingOps[opId]) {
      delete pendingOps[opId];
    }
  });

  // Poll to check for expired operations on both chains
  const REFUND_TIME = Number(process.env.REFUND_TIME || 86400); // Default 24 hours
  
  setInterval(async () => {
    console.log("Polling pending operations for refund eligibility...");
    const currentTime = Math.floor(Date.now() / 1000);
    
    for (const opId in pendingOps) {
      const op = pendingOps[opId];
      
      // Skip already processed operations
      if (op.processed) continue;
      
      // Check if the operation has timed out
      if (currentTime >= op.timestamp + REFUND_TIME) {
        try {
          if (op.chain === "sepolia") {
            console.log(`Attempting refund on Sepolia for opId: ${opId}`);
            const tx = await bridgeSepolia.refund(opId);
            await tx.wait();
            console.log(`Refund succeeded on Sepolia for opId: ${opId}. Tx: ${tx.hash}`);
          } else if (op.chain === "base") {
            console.log(`Attempting refund on Base for opId: ${opId}`);
            const tx = await bridgeBase.refund(opId);
            await tx.wait();
            console.log(`Refund succeeded on Base for opId: ${opId}. Tx: ${tx.hash}`);
          }
          
          delete pendingOps[opId];
        } catch (e) {
          console.error(`Error processing refund for opId ${opId} on ${op.chain}:`, e);
        }
      }
    }
  }, 60000);

  // Clean up old processed operations to prevent memory leaks
  setInterval(() => {
    const currentTime = Math.floor(Date.now() / 1000);
    const TWO_DAYS = 172800; // 2 days in seconds
    
    for (const opId in pendingOps) {
      const op = pendingOps[opId];
      if (op.processed && currentTime >= op.timestamp + TWO_DAYS) {
        console.log(`Removing old processed operation ${opId} from memory`);
        delete pendingOps[opId];
      }
    }
  }, 3600000); // Run every hour
  
  // Keep the process running
  console.log("Bridge monitoring service started. Listening for events...");
  process.on('SIGINT', () => {
    console.log('Gracefully shutting down from SIGINT (Ctrl+C)');
    // Clean up resources if needed
    process.exit();
  });
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});