pragma solidity ^0.4.23;

import "../modifications/SimpleModification.sol";

contract SimpleModificiatonTest is SimpleModification {
    constructor(uint256 _window, uint256 _totalSupply) public {
        windowSize = _window;
        balances[msg.sender] = _totalSupply;
    }
}
