// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

library Error {
    error InvalidAddress();
    error InsufficientAmount();
    error InvalidTokenAddress();
    error TransferFailed();
    error NotOwner();
    error AlreadyProcessed();
}
