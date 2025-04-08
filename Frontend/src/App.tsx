import { WagmiProvider } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { baseSepolia, sepolia } from "wagmi/chains";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./page/TokenBridge";
import "./App.css";

function App() {
  const config = getDefaultConfig({
    appName: "MTK Token Bridge",
    projectId: "YOUR_PROJECT_ID", // Replace with your actual project ID
    chains: [sepolia],
    ssr: false, // Set to true if using SSR
  });
  
  const queryClient = new QueryClient();
  
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Home />
          <ToastContainer position="top-right" autoClose={3000} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;