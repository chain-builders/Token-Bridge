
const { ethers } = require('ethers');
require('dotenv').config();

const providerSepolia = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC);
const providerBase = new ethers.JsonRpcProvider(process.env.BASE_RPC);

const walletSepolia = new ethers.Wallet(process.env.PRIVATE_KEY, providerSepolia);
const walletBase = new ethers.Wallet(process.env.PRIVATE_KEY, providerBase);

const bridgeSepoliaAbi = require('./abis/BridgeSepolia.json').abi;
const bridgeBaseAbi = require('./abis/BridgeBase.json').abi;
const bridgeSepolia = new ethers.Contract(process.env.BRIDGE_SEPOLIA, bridgeSepoliaAbi, walletSepolia);
const bridgeBase = new ethers.Contract(process.env.BRIDGE_BASE, bridgeBaseAbi, walletBase);

bridgeSepolia.on('BridgeInitiated', async (user, amount, targetChain, txHash) => {
  try {
    console.log(`Sepolia event: ${user}, ${amount}, ${targetChain}, ${txHash}`);
    const tx = await bridgeBase.mintTokens(user, amount, txHash);
    await tx.wait();
    console.log('Minted tokens on Base:', tx.hash);
  } catch (error) {
    console.error('Error minting tokens on Base:', error);
  }
});

bridgeBase.on('BridgeInitiated', async (user, amount, targetChain, txHash) => {
  console.log(`Base event: ${user}, ${amount}, ${targetChain}, ${txHash}`);
  const tx = await bridgeSepolia.releaseTokens(user, amount, txHash);
  await tx.wait();
  console.log('Released tokens on Sepolia:', tx.hash);
});
