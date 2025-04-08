// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

library Event {
    event Transfer(address indexed from, address indexed to, address toToken, uint256 amount);
    event Mint(uint256 amount);
    event Burn(uint256 amount);
    event BridgeInitiated(address indexed user, uint256 amount, string targetChain, bytes32 opId);
    event BridgeFinalized(address indexed user, uint256 amount, bytes32 opId);
    event Refund(address indexed user, uint256 amount, bytes32 opId);
}
