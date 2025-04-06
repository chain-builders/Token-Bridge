
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

abstract contract BridgeBase {
    mapping(bytes32 => bool) public processedTx;

    event BridgeInitiated(address indexed user, uint256 amount, string targetChain, bytes32 txHash);
    event BridgeFinalized(address indexed user, uint256 amount, bytes32 sourceTx);

    modifier onlyOnce(bytes32 txHash) {
        require(!processedTx[txHash], "Already processed");
        _;
        processedTx[txHash] = true;
    }
}