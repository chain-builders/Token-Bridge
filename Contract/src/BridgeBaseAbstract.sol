// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./library/Errors.sol";
abstract contract BridgeBaseAbstract {
    mapping(bytes32 => bool) public processedTx;

    modifier onlyOnce(bytes32 txHash) {
        if (processedTx[txHash]) {
            revert Error.AlreadyProcessed();   
        }
        _;
        processedTx[txHash] = true;
    }
}