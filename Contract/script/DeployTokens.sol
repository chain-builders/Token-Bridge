// src/DeployBblToken.s.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/tokens/Bbl.sol";

contract DeployBblToken is Script {
    function run() external {
        vm.startBroadcast();
        BblToken bblToken = new BblToken();
        vm.stopBroadcast();
    }
}