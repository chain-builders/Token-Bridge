// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/BridgeBase.sol";
import "../src/tokens/Bbl.sol";

contract BridgeBaseTest is Test {
    Bbl token;
    BridgeBase bridge;
    address user = address(0x456);
    uint256 conversionRate = 0.7e18;

    function setUp() public {
        token = new Bbl("WrappedBigBroToken", "WBBT");
        bridge = new BridgeBase(address(token), conversionRate);
    }

    function testMintTokens() public {
        uint256 amount = 100 * 1e18;
        // Simulate a BridgeInitiated event on the source chain;
        // Compute opId using current timestamp.
        bytes32 opId = keccak256(abi.encodePacked(user, (amount * conversionRate) / 1e18, block.timestamp));
        uint256 supplyBefore = token.totalSupply();
        bridge.mintTokens(user, amount, opId);
        uint256 finalAmount = (amount * conversionRate) / 1e18;
        uint256 supplyAfter = token.totalSupply();
        assertEq(supplyAfter, supplyBefore + finalAmount);
        assertEq(token.balanceOf(user), finalAmount);
    }

    function testBurnTokens() public {
        // Mint 200 tokens to user so that they can be burned.
        token.mint(user, 200 * 1e18);
        // User must approve bridge to spend tokens.
        vm.prank(user);
        token.approve(address(bridge), 200 * 1e18);
        uint256 burnAmount = 100 * 1e18;
        vm.prank(user);
        bridge.burnTokens(burnAmount, "Sepolia");
        // After burning, user's token balance should decrease by burnAmount.
        uint256 userBalance = token.balanceOf(user);
        assertEq(userBalance, 100 * 1e18);
    }
}
