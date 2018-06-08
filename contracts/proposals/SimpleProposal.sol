pragma solidity ^0.4.23;

import "./GenericProposal.sol";

contract SimpleProposal is GenericProposal {
    event ProposalCreated(
        address indexed target,
        uint256 indexed windowEnd,
        uint256 indexed id
    );

    function createProposal(address _target)
    public returns(uint256){
        uint256 _id = proposals.length++;
        Proposal storage p = proposals[_id];
        p.target = _target;
        p.windowEnd = now + windowSize;
        emit ProposalCreated(_target, p.windowEnd, _id);
        return _id;
    }

}
