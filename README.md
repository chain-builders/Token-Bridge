# Token-Bridge Smart Contract

Token-Bridge is a Solidity smart contract that facilitates token bridging between different blockchains. It allows the minting and burning of tokens, ensuring secure and seamless token transfers.

## Features

- **Mint Tokens:** Mint tokens to a specific address.
- **Burn Tokens:** Burn tokens and initiate a bridge to another chain.
- **Reentrancy Protection:** Utilizes OpenZeppelin's `ReentrancyGuard` to prevent reentrancy attacks.
- **Custom Error Handling:** Implements custom errors for invalid operations.
- **Event Emission:** Emits events to track token bridging activities.

## Prerequisites

- Node.js (>=14.x)
- npm or yarn
- Hardhat (Ethereum development environment)
- OpenZeppelin Contracts

## Getting Started

### 1. Clone the Repository

```sh
git clone https://github.com/chain-builders/Token-Bridge.git
cd bridgebase
```

### 2. Install Dependencies

Install the required npm packages:

```sh
npm install
# or
yarn install
```

### 3. Compile the Contracts

Compile the smart contracts using Hardhat:

```sh
npx hardhat compile
```

### 4. Deploy the Contracts

Deploy the contracts to your desired network:

```sh
npx hardhat run scripts/deploy.js --network <network-name>
```

Replace `<network-name>` with the network to which you want to deploy (e.g., `ropsten`, `mainnet`).

### 5. Run Tests

Run the test cases to ensure everything is working correctly:

```sh
npx hardhat test
```

## Project Structure

- **contracts/**: Contains the Solidity smart contracts.
  - `BridgeBase.sol`: Main contract for token bridging.
  - `BridgeBaseAbstract.sol`: Abstract base contract.
  - `library/Errors.sol`: Custom error definitions.
  - `library/Events.sol`: Custom event definitions.
  - `tokens/Bbl.sol`: BBL token contract.
- **scripts/**: Deployment scripts.
- **test/**: Test cases for the smart contracts.

## Example Usage

### Minting Tokens

```solidity
function mintTokens(address to, uint256 amount, bytes32 sourceTx)
```

- `to`: Address to mint tokens to.
- `amount`: Amount of tokens to mint.
- `sourceTx`: Source transaction hash.

### Burning Tokens

```solidity
function burnTokens(uint256 amount, string memory targetChain)
```

- `amount`: Amount of tokens to burn.
- `targetChain`: Target chain identifier.

## Events

- `Event.BridgeFinalized(address to, uint256 amount, bytes32 sourceTx)`: Emitted when tokens are minted.
- `Event.BridgeInitiated(address from, uint256 amount, string targetChain, bytes32 hash)`: Emitted when tokens are burned.

## Errors

- `Error.InvalidTokenAddress()`: Thrown when the token address is invalid.
- `Error.InsufficientAmount()`: Thrown when the amount is zero.

## Frontend features and framework

# React + TypeScript + Vite

Setup to get React working in Vite 

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh


### Instructions on How to Run the Frontend Framework

1. **Install Dependencies**:
   Ensure you have Node.js installed. Then, navigate to the `Frontend` directory and run:
   ```bash
   npm install
   ```

2. **Start the Development Server**:
   To start the development server, run:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   To build the project for production, run:
   ```bash
   npm run build
   ```

4. **Preview the Production Build**:
   To preview the production build locally, run:
   ```bash
   npm run serve
   ```

5. **Linting**:
   To run ESLint and check for linting issues, run:
   ```bash
   npm run lint
   ```

6. **Testing**:
   (If applicable) To run tests, use:
   ```bash
   npm test
   ```


