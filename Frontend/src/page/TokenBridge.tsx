import { useState } from "react";
import { parseEther } from "ethers";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { toast } from "react-toastify";
import MyTokenAbi from "../abis/MyToken.json";
import BridgeSepoliaAbi from "../abis/BridgeSepolia.json";

const TOKEN_ADDRESS = "0x7e86897eb6641096141A27923f6E00Df3D63F833";
const BRIDGE_ADDRESS = "0x67E9F7E909a2B0e429af46D12c125e7fe8fF37A0";

function TokenBridge() {
  // State variables for form inputs
  const [mintAmount, setMintAmount] = useState("");
  const [bridgeAmount, setBridgeAmount] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { writeContractAsync, data: hash } = useWriteContract();

  
  // Read token balance
  const { data: tokenBalance } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: MyTokenAbi.abi,
    functionName: "balanceOf",
    args: [address],
  });
  console.log("Token Balance:", tokenBalance);
  // Mint tokens
  const mintTokens = async () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }

    if (!mintAmount || isNaN(Number(mintAmount)) || Number(mintAmount) <= 0) {
      toast.error("Please enter a valid amount to mint");
      return;
    }

    try {
      const txResponse = await writeContractAsync({
        address: TOKEN_ADDRESS,
        abi: MyTokenAbi.abi,
        functionName: "mint",
        args: [address, parseEther(mintAmount)],
      });

      toast.info("Minting tokens... Please wait");

      if (!txResponse) {
        throw new Error("Transaction failed to submit");
      }
      toast.success(`Successfully minted ${mintAmount} MTK tokens!`);
      setMintAmount("");
    } catch (error) {
      const errorMessage =
        (error as any)?.message?.split("(")[0] ||
        (error as any)?.message ||
        "Unknown error";
      toast.error(`Error minting tokens: ${errorMessage}`);
    }
  };

  // Bridge tokens
  const bridgeTokens = async () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }

    if (
      !bridgeAmount ||
      isNaN(Number(bridgeAmount)) ||
      Number(bridgeAmount) <= 0
    ) {
      toast.error("Please enter a valid amount to bridge");
      return;
    }

    try {
      // First approve tokens
      const approvalTx = await writeContractAsync({
        address: TOKEN_ADDRESS,
        abi: MyTokenAbi.abi,
        functionName: "approve",
        args: [BRIDGE_ADDRESS, parseEther(bridgeAmount)],
      });

      toast.info("Approving tokens... Please wait");

      if (!approvalTx) {
        throw new Error("Transaction failed to submit");
      }

      // Then lock tokens for bridging
      const bridgeTx = await writeContractAsync({
        address: BRIDGE_ADDRESS,
        abi: BridgeSepoliaAbi.abi,
        functionName: "lockTokens",
        args: [parseEther(bridgeAmount), "Mumbai"],
      });

      toast.info("Bridging tokens... Please wait");

      if (!bridgeTx) {
        throw new Error("Transaction failed to submit");
      }

      toast.success(
        `Successfully bridged ${bridgeAmount} MTK tokens to Mumbai!`
      );
      setBridgeAmount("");
    } catch (error) {
      const errorMessage =
        (error as any)?.message?.split("(")[0] ||
        (error as any)?.message ||
        "Unknown error";
      toast.error(`Error bridging tokens: ${errorMessage}`);
    }
  };

  // Transfer tokens
  const transferTokens = async () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }

    if (
      !transferAmount ||
      isNaN(Number(transferAmount)) ||
      Number(transferAmount) <= 0
    ) {
      toast.error("Please enter a valid amount to transfer");
      return;
    }

    if (!recipient || !recipient.startsWith("0x")) {
      toast.error("Please enter a valid recipient address");
      return;
    }

    try {
      const tx = await writeContractAsync({
        address: TOKEN_ADDRESS,
        abi: MyTokenAbi.abi,
        functionName: "transfer",
        args: [recipient, parseEther(transferAmount)],
      });

      toast.info("Transferring tokens... Please wait");

      if (!tx) {
        throw new Error("Transaction failed to submit");
      }

      toast.success(
        `Successfully transferred ${transferAmount} MTK tokens to ${recipient}!`
      );
      setTransferAmount("");
      setRecipient("");
    } catch (error) {
      const errorMessage =
        (error as any)?.message?.split("(")[0] ||
        (error as any)?.message ||
        "Unknown error";
      toast.error(`Error transferring tokens: ${errorMessage}`);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-3xl">
      
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700 rounded-xl shadow-lg">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-white">MTK Token Bridge</h1>
            <p className="text-blue-100 mt-1">Seamlessly bridge tokens between networks</p>
          </div>
          
          <div className="flex flex-col items-center md:items-end">
            <ConnectButton.Custom>
              {({ account, openAccountModal, openConnectModal, mounted }) => {
                const connected = mounted && account;
                
                return (
                  <div>
                    {connected ? (
                      <button
                        onClick={openAccountModal}
                         className="bg-white text-indigo-700 px-6 py-2.5  mt-6 rounded-lg hover:bg-opacity-90 transition-all duration-300 font-medium flex items-center space-x-2"
                      >
                        <span>{account.displayName}</span>
                      </button>
                    ) : (
                      <button
                        onClick={openConnectModal}
                        className="bg-white text-indigo-700 px-6 py-2.5 rounded-lg hover:bg-opacity-90 transition-all duration-300 font-medium flex items-center space-x-2"
                      >
                        <span>Connect Wallet</span>
                      </button>
                    )}
                  </div>
                );
              }}
            </ConnectButton.Custom>
            
            {isConnected && (
              <div className="mt-3 bg-white bg-opacity-10 backdrop-blur-md px-4 py-2 rounded-lg transition-all duration-500 opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2">
                <div className="flex items-center space-x-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse"></div>
                  <p className="text-white text-sm">
                    {tokenBalance 
                      ? `${(Number(tokenBalance) / 10**18).toFixed(4)} MTK`
                      : "Loading balance..."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


      <>
          

          <div className="grid gap-6">
            {/* Mint Section */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Mint Tokens</h2>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="number"
                  placeholder="Amount to mint"
                  value={mintAmount}
                  onChange={e => setMintAmount(e.target.value)}
                  className="flex-1 p-2 border rounded"
                />
                <button 
                  onClick={mintTokens}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  Mint Tokens
                </button>
              </div>
            </div>

            {/* Bridge Section */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Bridge to Mumbai</h2>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="number"
                  placeholder="Amount to bridge"
                  value={bridgeAmount}
                  onChange={e => setBridgeAmount(e.target.value)}
                  className="flex-1 p-2 border rounded"
                />
                <button 
                  onClick={bridgeTokens}
                  className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition-colors"
                >
                  Bridge Tokens
                </button>
              </div>
            </div>

            {/* Transfer Section */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Transfer Tokens</h2>
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Recipient address (0x...)"
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    type="number"
                    placeholder="Amount to transfer"
                    value={transferAmount}
                    onChange={e => setTransferAmount(e.target.value)}
                    className="flex-1 p-2 border rounded"
                  />
                  <button 
                    onClick={transferTokens}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    Transfer Tokens
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
    </div>
  );
}

export default TokenBridge;
