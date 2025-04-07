// script/DeployMumbai.s.sol
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/tokens/Bbl.sol";
import "../src/BridgeBase.sol";

contract DeployMumbai is Script {
    function run() external {
        vm.startBroadcast();

        Bbl token = new Bbl();
        console.log(" Wrapped Bbl (Mumbai) deployed at:", address(token));

        BridgeBase bridge = new BridgeBase(address(token));
        console.log(" BridgeBase deployed at:", address(bridge));

        token.grantRole(token.BRIDGE_ROLE(), address(bridge));
        console.log(" Granted BRIDGE_ROLE to BridgeBase:", address(bridge));

        vm.stopBroadcast();
    }
}
