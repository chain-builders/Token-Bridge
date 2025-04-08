
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BridgeBaseAbstract.sol";
import "./library/Errors.sol";
import "./library/Events.sol";
import "./tokens/Bbl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IUniswapV2Pair.sol";   

contract BridgeSepolia is BridgeBaseAbstract, ReentrancyGuard {
    Fabs public token;
    IUniswapV2Pair public ammPool;
    address public stablecoin; // 
 
    constructor(address _token, address _ammPool, address _stablecoin) {
        token = Fabs(_token);
        ammPool = IUniswapV2Pair(_ammPool);
        stablecoin = _stablecoin;
    }

    // uint256 destinationAmount = (sourceAmount * 250) / 100; 

    function getTokenPrice() public view returns (uint256) {
        (uint112 reserve0, uint112 reserve1,) = ammPool.getReserves();
        uint256 tokenPrice = (uint256(reserve0) * 1e18) / uint256(reserve1);
        return tokenPrice;
    } 
    function getDestinationAmount(uint256 sourceAmount) public view returns (uint256) {
        uint256 tokenPrice = getTokenPrice();
        uint256 destinationAmount = (sourceAmount * tokenPrice) / 1e18;
        return destinationAmount;
    }

    function lockTokens(uint256 amount, string memory targetChain) external nonReentrant {
        token.transferFrom(msg.sender, address(this), amount);
        emit Event.BridgeInitiated(msg.sender, destinationAmount, targetChain, keccak256(abi.encodePacked(msg.sender, destinationAmount, block.timestamp)));
    }

    function releaseTokens(address to, uint256 amount, bytes32 sourceTx) external onlyOnce(sourceTx) {
        token.transfer(to, amount);
        emit Event.BridgeFinalized(to, amount, sourceTx);
    }
}