// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BblToken is ERC20("BabelToken", "BBL"){
    address public owner;

    constructor() {
        owner = msg.sender;
        _mint(msg.sender, 100000e18);
    }

    function mint(uint256 _amount)  external {
        require(msg.sender == owner, "Only owner can mint");
        _mint(owner, _amount);
    }   
}