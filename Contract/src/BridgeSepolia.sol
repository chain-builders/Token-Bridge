
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BridgeBaseAbstract.sol";
import "./MyToken.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BridgeSepolia is BridgeBase, ReentrancyGuard {
    MyToken public token;

    constructor(address _token) {
        token = MyToken(_token);
    }

    function lockTokens(uint256 amount, string memory targetChain) external nonReentrant {
        token.transferFrom(msg.sender, address(this), amount);
        emit BridgeInitiated(msg.sender, amount, targetChain, keccak256(abi.encodePacked(msg.sender, amount, block.timestamp)));
    }

    function releaseTokens(address to, uint256 amount, bytes32 sourceTx) external onlyOnce(sourceTx) {
        token.transfer(to, amount);
        emit BridgeFinalized(to, amount, sourceTx);
    }
}