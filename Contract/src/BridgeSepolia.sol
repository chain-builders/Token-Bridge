
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BridgeBaseAbstract.sol";
import "./library/Errors.sol";
import "./library/Events.sol";
import "./tokens/Bbl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BridgeSepolia is BridgeBase, ReentrancyGuard {
    Bbl public token;

    constructor(address _token) {
        token = Bbl(_token);
    }

    function lockTokens(uint256 amount, string memory targetChain) external nonReentrant {
        token.transferFrom(msg.sender, address(this), amount);
        emit Event.BridgeInitiated(msg.sender, amount, targetChain, keccak256(abi.encodePacked(msg.sender, amount, block.timestamp)));
    }

    function releaseTokens(address to, uint256 amount, bytes32 sourceTx) external onlyOnce(sourceTx) {
        token.transfer(to, amount);
        emit Event.BridgeFinalized(to, amount, sourceTx);
    }
}