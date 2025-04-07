// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/tokens/Bbl.sol";

contract BblTest is Test {
    Bbl token;
    address admin = address(1);
    address bridge = address(2);
    address user1 = address(3);
    address user2 = address(4);

    function setUp() public {
        // Deploy token as admin
        vm.startPrank(admin);
        token = new Bbl("Test Token", "TEST");

        // Grant bridge role to bridge address
        token.grantRole(token.BRIDGE_ROLE(), bridge);
        vm.stopPrank();

        // Mint tokens as bridge
        vm.startPrank(bridge);
        token.mint(admin, 100_000 * 10 ** token.decimals());
        vm.stopPrank();
    }

    function test_InitialState() public view {
        // Test token metadata
        assertEq(token.name(), "Test Token");
        assertEq(token.symbol(), "TEST");
        assertEq(token.decimals(), 18);

        // Test initial mint
        assertEq(token.balanceOf(admin), 200_000 * 10 ** token.decimals());
    }

function test_Mint() public {
    uint256 amount = 100 ether;

    // Test bridge can mint
    vm.prank(bridge);
    token.mint(user1, amount);
    assertEq(token.balanceOf(user1), amount);

    // Test others cannot mint
    vm.expectRevert(
        abi.encodeWithSelector(
            bytes4(keccak256("AccessControlUnauthorizedAccount(address,bytes32)")),
            user1,
            token.BRIDGE_ROLE()
        )
    );
    vm.prank(user1);
    token.mint(user2, amount);
}

function test_BurnFromBridge() public {
    uint256 amount = 100 ether;

    // Give user1 some tokens first
    vm.prank(bridge);
    token.mint(user1, amount);

    // Test bridge can burn
    vm.prank(bridge);
    token.burnFromBridge(user1, amount);
    assertEq(token.balanceOf(user1), 0);

    // Test others cannot burn
    vm.prank(bridge);
    token.mint(user1, amount); // Reset balance

    vm.expectRevert(
        abi.encodeWithSelector(
            bytes4(keccak256("AccessControlUnauthorizedAccount(address,bytes32)")),
            user1,
            token.BRIDGE_ROLE()
        )
    );
    vm.prank(user1);
    token.burnFromBridge(user1, amount);
}

    function test_Burnable() public {
        uint256 amount = 100 ether;

        // Give user1 some tokens
        vm.prank(bridge);
        token.mint(user1, amount);

        // Test user can burn their own tokens
        vm.prank(user1);
        token.burn(amount);
        assertEq(token.balanceOf(user1), 0);
    }

    function test_GetBalance() public {
        uint256 amount = 100 ether;

        vm.prank(bridge);
        token.mint(user1, amount);

        assertEq(token.getBalance(user1), amount);
        assertEq(token.getBalance(user2), 0);
    }
}