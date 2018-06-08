pragma solidity ^0.4.23;

import "./GenericProposal.sol";

contract DetailedProposal is GenericProposal {
    event ProposalCreated(
        address indexed target,
        uint256 indexed windowEnd,
        uint256 indexed id,
        bytes32 detailsHash
    );

    function createProposal(address _target, bytes32 _hash)
    public returns(uint256){
        uint256 _id = proposals.length++;
        Proposal storage p = proposals[_id];
        p.target = _target;
        p.windowEnd = now + windowSize;
        emit ProposalCreated(_target, p.windowEnd, _id, _hash);
        return _id;
    }
}
