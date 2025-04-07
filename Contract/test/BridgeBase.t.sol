// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/BridgeBase.sol";
import "../src/tokens/Bbl.sol";
import "../src/library/Errors.sol";
import "../src/library/Events.sol";

contract BridgeBaseTest is Test {
    BridgeBase bridge;
    Bbl token;
    
    address admin = address(1);
    address user1 = address(2);
    address user2 = address(3);
    
    function setUp() public {
        // Deploy BBL token - assuming constructor needs name and symbol
        token = new Bbl("Test Token", "TEST");
        
        // Grant minter role to this test contract
        bytes32 minterRole = token.BRIDGE_ROLE();
        token.grantRole(minterRole, address(this));
        
        // Deploy BridgeBase contract
        bridge = new BridgeBase(address(token));
        
        // Give some initial tokens to user1 for testing burn functionality
        token.mint(user1, 1000 ether);
        vm.prank(user1);
        token.approve(address(bridge), type(uint256).max);
        
        // Grant minter role to bridge contract if needed
        token.grantRole(minterRole, address(bridge));
    }
    
    function test_Constructor() public {
        // Test valid token address
        new BridgeBase(address(token));
        
        // Test invalid token address
        vm.expectRevert(abi.encodeWithSelector(Error.InvalidTokenAddress.selector));
        new BridgeBase(address(0));
    }
    
    function test_MintTokens() public {
        uint256 amount = 100 ether;
        bytes32 sourceTx = keccak256("test-tx");
        
        // Test minting by non-owner (should work as there's no ownership check)
        vm.prank(user1);
        bridge.mintTokens(user2, amount, sourceTx);
        
        // Check balances and events
        assertEq(token.balanceOf(user2), amount);
        
        // Check event emission
        vm.expectEmit(true, true, true, true);
        emit Event.BridgeFinalized(user2, amount, sourceTx);
        vm.prank(user1);
        bridge.mintTokens(user2, amount, sourceTx);
        
        // Test insufficient amount
        vm.expectRevert(abi.encodeWithSelector(Error.InsufficientAmount.selector));
        bridge.mintTokens(user2, 0, sourceTx);
    }
    
    function test_BurnTokens() public {
        uint256 amount = 100 ether;
        string memory targetChain = "ethereum";
        
        // Test burning
        vm.prank(user1);
        bridge.burnTokens(amount, targetChain);
        
        // Check balances
        assertEq(token.balanceOf(user1), 900 ether); // 1000 initial - 100 burned
        
        // Check event emission
        bytes32 expectedTxHash = keccak256(abi.encodePacked(user1, amount, block.timestamp));
        vm.expectEmit(true, true, true, true);
        emit Event.BridgeInitiated(user1, amount, targetChain, expectedTxHash);
        vm.prank(user1);
        bridge.burnTokens(amount, targetChain);
        
        // Test insufficient amount
        vm.expectRevert(abi.encodeWithSelector(Error.InsufficientAmount.selector));
        vm.prank(user1);
        bridge.burnTokens(0, targetChain);
    }
}
