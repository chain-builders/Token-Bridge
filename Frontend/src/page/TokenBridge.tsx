// pages/index.tsx
import { useState } from "react";
import { ArrowRight, Wallet, RefreshCcw, Info } from "lucide-react";
import { useAccount } from "wagmi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  const [fromToken, setFromToken] = useState("BASE");
  const [toToken, setToToken] = useState("LINER");
  const [amount, setAmount] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const { address, isConnected } = useAccount();

  const swapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  const handleBridge = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    toast.info("Initiating bridge transaction...");

    // Simulate transaction processing
    setTimeout(() => {
      setIsLoading(false);
      toast.success(
        `Successfully bridged ${amount} ${fromToken} to ${toToken}!`
      );
      setAmount("");
    }, 3000);
  };

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
          <div className="bg-gradient-to-r  mb-4 from-blue-500 to-purple-600 text-white  py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg ml-5 ">
            <ConnectButton.Custom>
              {({ account, openAccountModal, openConnectModal, mounted }) => {
                const connected = mounted && account;

                return (
                  <div>
                    {connected ? (
                      <button onClick={openAccountModal} className=" w-full">
                        <span className="text-white w-full font-medium">
                          {account.displayName}
                        </span>
                      </button>
                    ) : (
                      <button onClick={openConnectModal} className=" flex flex-row justify-center w-full">
                        <span className="text-white font-medium mr-2">
                          Connect Wallet

                        </span>
                        <Wallet/>
                      </button>
                    )}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From
            </label>
            <div className="relative">
              <select
                value={fromToken}
                onChange={(e) => setFromToken(e.target.value)}
                className="block w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="BASE">BASE</option>
                <option value="LINER">LINER</option>
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
                onChange={(e) => setToToken(e.target.value)}
                className="block w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="BASE">BASE</option>
                <option value="LINER">LINER</option>
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
