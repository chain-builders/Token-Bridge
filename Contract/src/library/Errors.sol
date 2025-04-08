// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library Error {
    error InvalidTokenAddress();
    error InsufficientAmount();
    error InsufficientBalance();
    error InsufficientAllowance();
    error InvalidRecipient();
    error AlreadyFinalized();
    error NotAuthorized();
    error RefundTooEarly();
    error AlreadyProcessed();
}
