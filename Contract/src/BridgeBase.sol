// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./BridgeBaseAbstract.sol";
import "./library/Errors.sol";
import "./library/Events.sol";
import "./tokens/Bbl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BridgeBase is BridgeBaseAbstract, ReentrancyGuard {
    Bbl public immutable token;
    uint256 public conversionRate;

    constructor(address _token, uint256 _conversionRate) {
        if (_token == address(0)) revert Error.InvalidTokenAddress();
        token = Bbl(_token);
        conversionRate = _conversionRate;
    }

    function setConversionRate(uint256 _conversionRate) external {
        conversionRate = _conversionRate;
    }

    function mintTokens(address to, uint256 amount, bytes32 sourceTx) external nonReentrant {
        if (amount == 0) revert Error.InsufficientAmount();
        if (to == address(0)) revert Error.InvalidRecipient();
        uint256 finalAmount = (amount * conversionRate) / 1e18;
        token.mint(to, finalAmount);
        emit Event.BridgeFinalized(to, finalAmount, sourceTx);
    }

    function burnTokens(uint256 amount, string calldata targetChain) external nonReentrant {
        if (amount == 0) revert Error.InsufficientAmount();
        if (token.balanceOf(msg.sender) < amount) revert Error.InsufficientBalance();
        token.burnFromBridge(msg.sender, amount);
        emit Event.BridgeInitiated(
            msg.sender,
            amount,
            targetChain,
            keccak256(abi.encodePacked(msg.sender, amount, block.timestamp))
        );
    }
}
