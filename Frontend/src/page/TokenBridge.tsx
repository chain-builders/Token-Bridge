// pages/index.tsx
import { useState } from "react";
import { ArrowRight, Wallet, RefreshCcw, Info } from "lucide-react";
import { parseEther } from "ethers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import MyTokenAbi from "../abis/Bbl.json";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import BridgeSepoliaAbi from "../abis/BridgeSepolia.json";
import BridgeBase from "../abis/BridgeBase.json";

export default function Home() {
  type TokenType = keyof typeof CONTRACT_ADDRESSES;
  const [fromToken, setFromToken] = useState<TokenType>("BASE");
  const [toToken, setToToken] = useState<TokenType>("SEPOLIA");
  const [amount, setAmount] = useState("");
  const { writeContractAsync, data: hash } = useWriteContract();
  const [isLoading, setIsLoading] = useState(false);
  const { address, isConnected } = useAccount();

  const CONTRACT_ADDRESSES = {
    BASE: {
      TOKEN: "0xc0b0d50b6b15B0E9A6fF53fA80AA406B10432271",
      BRIDGE: "0xac7f8CcF7973BdB40E07E5E49e97B6cCad17ef26",
    },
    SEPOLIA: {
      TOKEN: "0x35DdD28c68D86643dD3982a065e593F63252D218", 
      BRIDGE: "0xAbBf70A16433b3Fbc0611dE0a26fF9Fd927cD339",
    },
  };

  const swapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  const handleBridge = async () => {
    if (!isConnected) return;
    

    if (Number(amount) <= 0) {
      toast.error("Please enter a valid amount to bridge");
      return;
    }

    try {
      setIsLoading(true);

      // Get the correct addresses based on the fromToken
      const tokenAddress = CONTRACT_ADDRESSES[fromToken].TOKEN;
      const bridgeAddress = CONTRACT_ADDRESSES[fromToken].BRIDGE;

      // Approve tokens first
      toast.info("Approving tokens... Please wait", {
        autoClose: false,
        toastId: "approving",
      });
      const approvalTx = await writeContractAsync({
        address: tokenAddress as `0x${string}`,
        abi: MyTokenAbi.abi,
        functionName: "approve",
        args: [bridgeAddress, parseEther(amount)],
      });

      if (!approvalTx) {
        throw new Error("Transaction failed to submit");
      }

      toast.dismiss("approving");
      toast.info("Bridging tokens... Please wait", {
        autoClose: false,
        toastId: "bridging",
      });

    
      let bridgeFunctionName;
      let destinationChain;
      let abi;

      if (fromToken === "BASE") {
        bridgeFunctionName = "burnTokens";
        destinationChain = "Sepolia";
        abi = BridgeBase.abi;
      } else if (fromToken === "SEPOLIA") {
        bridgeFunctionName = "lockTokens";
        destinationChain = "Base";
        abi = BridgeSepoliaAbi.abi;
      } else {
        throw new Error("Unsupported token bridge path");
      }

      const bridgeTx = await writeContractAsync({
        address: bridgeAddress as `0x${string}`,
        abi, 
        functionName: bridgeFunctionName,
        args: [parseEther(amount), destinationChain],
      });

      if (!bridgeTx) {
        throw new Error("Transaction failed to submit");
      }
      toast.dismiss("bridging");
      toast.success(`Successfully bridged ${amount} BBL tokens to ${toToken}!`);
      setAmount("");
    } catch (error) {
      toast.dismiss("approving");
      toast.dismiss("bridging");
      toast.error(
        `Error bridging tokens: ${
          (error as any).message?.split("(")[0] ||
          (error as any).message ||
          "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const { data: tokenBalance } = useReadContract({
    address: CONTRACT_ADDRESSES[fromToken].TOKEN as `0x${string}`,
    abi: MyTokenAbi.abi,
    functionName: "balanceOf",
    args: [address],
  });
  console.log("Token Balance:", tokenBalance)

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
      />

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Token Bridge</h1>
          <p className="text-gray-500 mt-2">
            Seamlessly bridge your tokens between networks
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700 rounded-xl shadow-lg">
              <div className="mb-4 md:mb-0">
                <h1 className="text-3xl font-bold text-white">
                  MTK Token Bridge
                </h1>
                <p className="text-blue-100 mt-1">
                  Seamlessly bridge tokens between networks
                </p>
              </div>

              <div className="flex flex-col items-center md:items-end">
                <ConnectButton.Custom>
                  {({
                    account,
                    openAccountModal,
                    openConnectModal,
                    mounted,
                  }) => {
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
                          ? `${(Number(tokenBalance) / 10 ** 18).toFixed(
                              4
                            )} BBL`
                          : "Loading balance..."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From
            </label>
            <div className="relative">
              <select
                value={fromToken}
                onChange={(e) => setFromToken(e.target.value as TokenType)}
                className="block w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="SEPOLIA">SEPOLIA</option>
                <option value="BASE">BASE</option>
              </select>
            </div>
          </div>

          <div className="flex justify-center my-4">
            <button
              onClick={swapTokens}
              className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition duration-200"
            >
              <ArrowRight className="h-5 w-5 text-gray-500 transform rotate-90" />
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To
            </label>
            <div className="relative">
              <select
                value={toToken}
                onChange={(e) => setToToken(e.target.value as TokenType)}
                className="block w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="BASE">BASE</option>
                <option value="SEPOLIA">SEPOLIA</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 text-sm font-medium"
                onClick={() => setAmount("0.1")}
              >
                MAX
              </button>
            </div>
          </div>

          <div className="flex items-center mb-6 p-3 bg-blue-50 rounded-lg">
            <Info className="h-5 w-5 text-blue-500 mr-2" />
            <p className="text-sm text-blue-700">
              Bridge fee: 0.1% • Est. time: ~15 minutes
            </p>
          </div>

          <button
            onClick={handleBridge}
            disabled={isLoading}
            className="w-full flex items-center justify-center bg-blue-600 text-white rounded-lg py-3 px-4 font-medium hover:bg-blue-700 transition duration-200 disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <RefreshCcw className="animate-spin h-5 w-5 mr-2" />
                Processing...
              </>
            ) : (
              "Bridge Tokens"
            )}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Need help?{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
