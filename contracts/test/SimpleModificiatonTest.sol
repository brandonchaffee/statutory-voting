pragma solidity ^0.4.23;

import "../modifications/SimpleModification.sol";

contract SimpleModificiatonTest is SimpleModification {
    constructor(uint256 _window, uint256 _totalSupply) public {
        windowSize = _window;
        totalSupply_ = _totalSupply;
        balances[msg.sender] = _totalSupply;
    }

    event Mint(address indexed to, uint256 amount);

    function mint(address _to, uint256 _amount) public returns (bool) {
      totalSupply_  = totalSupply_.add(_amount);
      balances[_to] = balances[_to].add(_amount);
      emit Mint(_to, _amount);
      return true;
    }

    event Burn(address indexed from, uint256 amount);

    function burn(address _from, uint256 _amount)
    public returns (bool) {
      totalSupply_  = totalSupply_.sub(_amount);
      balances[_from] = balances[_from].sub(_amount);
      emit Burn(_from, _amount);
      return true;
    }
}
