// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/BridgeSepolia.sol";
import "../src/tokens/Bbl.sol";
import "../src/library/Errors.sol";
import "../src/library/Events.sol";

contract BridgeSepoliaTest is Test {
    BridgeSepolia bridge;
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
        bridge = new BridgeSepolia(address(token));
        
        // Give some initial tokens to user1 for testing burn functionality
        token.mint(user1, 1000 ether);
        vm.prank(user1);
        token.approve(address(bridge), type(uint256).max);
        
        // Grant minter role to bridge contract if needed
        token.grantRole(minterRole, address(bridge));
    }
    
    function test_Constructor() public {
        assertEq(address(bridge.token()), address(token));
    }
    
    function test_LockTokens() public {
        uint256 amount = 100 ether;
        string memory targetChain = "arbitrum";
        
        // Test locking tokens
        vm.prank(user1);
        bridge.lockTokens(amount, targetChain);
        
        // Check balances
        assertEq(token.balanceOf(user1), 900 ether);
        assertEq(token.balanceOf(address(bridge)), amount);
        
        // Check event emission
        bytes32 expectedTxHash = keccak256(abi.encodePacked(user1, amount, block.timestamp));
        vm.expectEmit(true, true, true, true);
        emit Event.BridgeInitiated(user1, amount, targetChain, expectedTxHash);
        vm.prank(user1);
        bridge.lockTokens(amount, targetChain);
    }
    
    function test_ReleaseTokens() public {
        uint256 amount = 100 ether;
        bytes32 sourceTx = keccak256("test-tx");
        
        // First lock some tokens to bridge
        vm.prank(user1);
        bridge.lockTokens(amount, "arbitrum");
        
        // Test releasing tokens
        vm.prank(admin);
        bridge.releaseTokens(user2, amount, sourceTx);
        
        // Check balances
        assertEq(token.balanceOf(user2), amount);
        assertEq(token.balanceOf(address(bridge)), 0);
        
        // Test onlyOnce modifier
        vm.expectRevert(abi.encodeWithSelector(Error.AlreadyProcessed.selector));
        vm.prank(admin);
        bridge.releaseTokens(user2, amount, sourceTx);
    }
    
    function test_OnlyAdminCanRelease() public {
        // This test would need to be adjusted based on your actual access control
        // Currently the releaseTokens function has no access control in the provided contract
        // You might want to add a modifier like onlyOwner or onlyRelayer
        
        // Example of how it might look if you add access control:
        vm.prank(user1);
        vm.expectRevert();
        bridge.releaseTokens(user2, 100 ether, keccak256("test-tx"));
    }
}
