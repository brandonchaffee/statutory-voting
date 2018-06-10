pragma solidity ^0.4.23;

import "../modifications/DetailedModification.sol";

contract DetailedModificiatonTest is DetailedModification {
    constructor(uint256 _window, uint256 _totalSupply) public {
        windowSize = _window;
        totalSupply_ = _totalSupply;
        balances[msg.sender] = _totalSupply;
    }
}
