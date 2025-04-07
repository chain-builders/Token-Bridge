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
git clone https://github.com/yourusername/bridgebase.git
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

## License

This project is licensed under the UNLICENSED License.
