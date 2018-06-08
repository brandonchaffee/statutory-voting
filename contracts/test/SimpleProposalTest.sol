pragma solidity ^0.4.23;

import "../proposals/SimpleProposal.sol";

contract SimpleProposalTest is SimpleProposal {
    constructor(uint256 _window, uint256 _totalSupply) public {
        windowSize = _window;
        balances[msg.sender] = _totalSupply;
    }
}
