// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./BridgeBaseAbstract.sol";
import "./library/Errors.sol";
import "./library/Events.sol";
import "./tokens/Bbl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BridgeBase is BridgeBaseAbstract, ReentrancyGuard {
   BblToken public token;

    constructor(address _token) {
        if (_token == address(0)) Error.InvalidTokenAddress();        
        token = BblToken(_token);
    }

    function mintTokens(address to, uint256 amount, bytes32 sourceTx) external nonReentrant {
        if (amount == 0) Error.InsufficientAmount();
        token.mint(to, amount);       
        emit Event.BridgeFinalized(to, amount, sourceTx);
    }
    function burnTokens(uint256 amount, string memory targetChain) external nonReentrant {
        if (amount == 0) Error.InsufficientAmount();
        token.burn(msg.sender, amount);
        emit Event.BridgeInitiated(msg.sender, amount, targetChain, keccak256(abi.encodePacked(msg.sender, amount, block.timestamp)));
    }

}