pragma solidity ^0.4.23;

import "../modifications/SimpleModification.sol";

contract SimpleModificiatonTest is SimpleModification {
    constructor(uint256 _window, uint256 _totalSupply) public {
        windowSize = _window;
        totalSupply_ = _totalSupply;
        balances[msg.sender] = _totalSupply;
    }

    function add(uint256 _a, uint256 _b) public returns(uint256) {
        return _a + _b;
    }

    event Mint(address indexed to, uint256 amount);

    function mint(address _to,uint256 _amount) public returns (bool) {
      totalSupply_  = totalSupply_ .add(_amount);
      balances[_to] = balances[_to].add(_amount);
      emit Mint(_to, _amount);
      return true;
    }
}
