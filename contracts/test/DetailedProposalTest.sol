pragma solidity ^0.4.23;

import "../proposals/DetailedProposal.sol";

contract DetailedProposalTest is DetailedProposal {
    constructor(uint256 _window, uint256 _totalSupply) public {
        windowSize = _window;
        balances[msg.sender] = _totalSupply;
    }
}
