// script/DeploySepolia.s.sol
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/tokens/Bbl.sol";
import "../src/BridgeSepolia.sol";

contract DeploySepolia is Script {
    function run() external {
        vm.startBroadcast();

        Bbl token = new Bbl();
        console.log(" Bbl (Sepolia) deployed at:", address(token));

        BridgeSepolia bridge = new BridgeSepolia(address(token));
        console.log(" BridgeSepolia deployed at:", address(bridge));

        token.grantRole(token.BRIDGE_ROLE(), address(bridge));
        console.log(" Granted BRIDGE_ROLE to BridgeSepolia:", address(bridge));

        vm.stopBroadcast();
    }
}
