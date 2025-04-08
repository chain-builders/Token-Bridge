// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import "lib/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "lib/v2-core/contracts/interfaces/IUniswapV2Pair.sol";

contract PoolCreator {
    address public immutable UNISWAP_FACTORY;
    
    constructor(address _factory) {
        UNISWAP_FACTORY = _factory;
    }
    
    function createPool(address tokenA, address tokenB) external returns (address poolAddress) {

        (address token0, address token1) = tokenA < tokenB 
            ? (tokenA, tokenB) 
            : (tokenB, tokenA);
        
        poolAddress = IUniswapV2Factory(UNISWAP_FACTORY).createPair(token0, token1);
    }
    
    function getPool(address tokenA, address tokenB) external view returns (address) {
        return IUniswapV2Factory(UNISWAP_FACTORY).getPair(tokenA, tokenB);
    }
}