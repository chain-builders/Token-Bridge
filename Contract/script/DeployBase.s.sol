// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/tokens/Bbl.sol";
import "../src/BridgeBase.sol";

contract DeployBase is Script {
    function run() external {
        vm.startBroadcast();

        Bbl token = new Bbl("WrappedBigBroToken", "WBBT");
        console.log("Wrapped Bbl (Base) deployed at:", address(token));

        uint256 conversionRate = 0.7e18; // 0.7 BBL = 1 ETH
        BridgeBase bridge = new BridgeBase(address(token), conversionRate);
        console.log("BridgeBase deployed at:", address(bridge));

        token.grantRole(token.BRIDGE_ROLE(), address(bridge));
        console.log("Granted BRIDGE_ROLE to BridgeBase:", address(bridge));

        vm.stopBroadcast();
    }
}
