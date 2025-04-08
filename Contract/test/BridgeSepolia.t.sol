// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/BridgeSepolia.sol";
import "../src/tokens/Bbl.sol";

contract BridgeSepoliaTest is Test {
    Bbl token;
    BridgeSepolia bridge;
    address user = address(0x123);
    uint256 conversionRate = 1e18; // 1 BBL = 1 ETH

    function setUp() public {
        token = new Bbl("BigBroToken", "BBT");
        // Mint 1000 tokens (with 18 decimals) to user
        token.mint(user, 1000 * 1e18);
        bridge = new BridgeSepolia(address(token), conversionRate);
        // Have user approve the bridge for 1000 tokens
        vm.prank(user);
        token.approve(address(bridge), 1000 * 1e18);
    }

    function testLockTokens() public {
        uint256 amount = 100 * 1e18;
        // Capture current timestamp before call so we can re-compute opId
        uint256 t = block.timestamp;
        vm.prank(user);
        bridge.lockTokens(amount, "Base");
        // Check that the bridge now holds the tokens locked by the user.
        uint256 bridgeBalance = token.balanceOf(address(bridge));
        assertEq(bridgeBalance, amount);
    }

    function testLockTokensFailInsufficientBalance() public {
        uint256 amount = 2000 * 1e18;
        vm.prank(user);
        vm.expectRevert(); // Expect revert due to insufficient balance
        bridge.lockTokens(amount, "Base");
    }

    function testLockTokensFailInsufficientAllowance() public {
        uint256 amount = 100 * 1e18;
        // Revoke approval first
        vm.prank(user);
        token.approve(address(bridge), 0);
        vm.prank(user);
        vm.expectRevert(); // Expect revert due to insufficient allowance
        bridge.lockTokens(amount, "Base");
    }

    function testRefund() public {
        uint256 amount = 100 * 1e18;
        // Capture current timestamp for opId computation
        uint256 t = block.timestamp;
        vm.prank(user);
        bridge.lockTokens(amount, "Base");
        // Recompute opId using the same parameters as in lockTokens
        bytes32 opId = keccak256(abi.encodePacked(user, (amount * conversionRate) / 1e18, t));
        // Warp forward in time beyond the refund period (default is 1 day = 86400 sec)
        vm.warp(block.timestamp + 86400 + 1);
        uint256 balanceBefore = token.balanceOf(user);
        // Anyone may now trigger a refund
        bridge.refund(opId);
        uint256 balanceAfter = token.balanceOf(user);
        // The user's balance should increase by the locked amount
        assertEq(balanceAfter, balanceBefore + amount);
    }
}
