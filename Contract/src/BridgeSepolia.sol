// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BridgeBaseAbstract.sol";
import "./library/Errors.sol";
import "./library/Events.sol";
import "./tokens/Bbl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BridgeSepolia is BridgeBaseAbstract, ReentrancyGuard {
    struct BridgeOperation {
        address user;
        uint256 amount;
        uint40 timestamp;
        bool finalized;
    }
    mapping(bytes32 => BridgeOperation) public bridgeOperations;
    uint256 public constant refundTime = 1 days;
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

    function lockTokens(uint256 amount, string calldata targetChain) external nonReentrant {
        if (amount == 0) revert Error.InsufficientAmount();
        if (token.balanceOf(msg.sender) < amount) revert Error.InsufficientBalance();
        if (token.allowance(msg.sender, address(this)) < amount) revert Error.InsufficientAllowance();
        token.transferFrom(msg.sender, address(this), amount);
        uint256 destAmount = (amount * conversionRate) / 1e18;
        bytes32 opId = keccak256(abi.encodePacked(msg.sender, destAmount, block.timestamp));
        bridgeOperations[opId] = BridgeOperation({
            user: msg.sender,
            amount: amount,
            timestamp: uint40(block.timestamp),
            finalized: false
        });
        emit Event.BridgeInitiated(msg.sender, destAmount, targetChain, opId);
    }

    function releaseTokens(address to, uint256 amount, bytes32 sourceTx) external onlyOnce(sourceTx) {
        if (to == address(0)) revert Error.InvalidRecipient();
        if (amount == 0) revert Error.InsufficientAmount();
        BridgeOperation storage op = bridgeOperations[sourceTx];
        if (op.finalized) revert Error.AlreadyFinalized();
        op.finalized = true;
        token.transfer(to, amount);
        emit Event.BridgeFinalized(to, amount, sourceTx);
    }

    // NOTE: Modified refund to allow anyone (e.g. a relayer) to trigger refund after the refund period.
    function refund(bytes32 opId) external nonReentrant {
        BridgeOperation storage op = bridgeOperations[opId];
        if (block.timestamp < op.timestamp + refundTime) revert Error.RefundTooEarly();
        if (op.finalized) revert Error.AlreadyFinalized();
        op.finalized = true;
        token.transfer(op.user, op.amount);
        emit Event.Refund(op.user, op.amount, opId);
    }
}
