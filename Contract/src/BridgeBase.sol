// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./library/Events.sol";
import "./library/Errors.sol";
import "./interface/IBridgeToken.sol";

contract BridgePolygon is Ownable {
    address public immutable baseTokenAddress;
    address public immutable polygonTokenAddress;
    
    IBridgeToken public immutable baseToken;
    IERC20 public immutable polygonToken;
    
    constructor(address _baseToken, address _polygonToken) Ownable(msg.sender) {
        if (_baseToken == address(0) || _polygonToken == address(0))
            revert Error.InvalidAddress();
        
        baseTokenAddress = _baseToken;
        polygonTokenAddress = _polygonToken;
        
        baseToken = IBridgeToken(_baseToken);
        polygonToken = IERC20(_polygonToken);
    }
    
    function transferBridge(
        address from,
        address to,
        address _baseToken,
        uint256 amount
    ) external {
        if (from == address(0) || to == address(0) || _baseToken == address(0))
            revert Error.InvalidAddress();
        if (amount <= 0) revert Error.InsufficientAmount();
        if (_baseToken != baseTokenAddress) revert Error.InvalidTokenAddress();
        
        bool success = polygonToken.transferFrom(from, address(this), amount);
        if (!success) revert Error.TransferFailed();
        
        baseToken.burn(address(this), amount);
        
        emit Event.Transfer(from, to, _baseToken, amount);
        emit Event.Burn(amount);
    }
    
    function mint(uint256 amount) external onlyOwner {
        if (amount == 0) revert Error.InsufficientAmount();
        
        baseToken.mint(address(this), amount);
        
        emit Event.Mint(amount);
    }
}