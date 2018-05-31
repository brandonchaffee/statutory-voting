pragma solidity ^0.4.23;

import "./BlockableTransfer.sol";

contract GenericProposal is BlockableTransfer {
    Proposal[] public proposals;

    struct Proposal {
        address target;
        uint256 windowEnd;
        bool isValid;
        uint yesTotal;
        uint noTotal;
        mapping(address => uint) yesVotesOf;
        mapping(address => uint) noVotesOf;
        bool hasBeenApproved;
    }

    function unblockTransfer() public {
        for(uint i=0; i < currentlyVoted[msg.sender].length; i++){
            Proposal storage p = proposals[i];
            p.noTotal -= p.noVotesOf[msg.sender];
            p.noVotesOf[msg.sender] = 0;
            p.yesTotal -= p.yesVotesOf[msg.sender];
            p.yesVotesOf[msg.sender] = 0;
        }
        delete currentlyVoted[msg.sender];
    }

    modifier inVoteWindow(uint256 _id) {
        require(now < proposals[_id].windowEnd);
        _;
    }

    function voteOnProposal(uint256 _id, bool _approve)
        inVoteWindow(_id)
    public {
        Proposal storage p = proposals[_id];
        if(_approve){
            p.noTotal -= p.noVotesOf[msg.sender];
            p.noVotesOf[msg.sender] = 0;
            p.yesVotesOf[msg.sender] = balances[msg.sender];
            p.yesTotal += balances[msg.sender];
        } else {
            p.yesTotal -= p.yesVotesOf[msg.sender];
            p.yesVotesOf[msg.sender] = 0;
            p.noVotesOf[msg.sender] = balances[msg.sender];
            p.noTotal += balances[msg.sender];
        }
        p.isValid = p.yesTotal > p.noTotal;
        currentlyVoted[msg.sender].push(_id);
    }

    function confirmProposal(uint256 _id) public {
        Proposal storage p = proposals[_id];
        require(now > p.windowEnd);
        require(p.isValid);
        require(!p.hasBeenApproved);
        approvedTarget = p.target;
        p.hasBeenApproved = true;
    }
}
