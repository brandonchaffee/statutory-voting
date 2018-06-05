pragma solidity ^0.4.23;

import "../BlockableTransfer.sol";

contract GenericModification is BlockableTransfer {
    Modification[] public modifications;

    struct Modification {
        bytes32 signature;
        bytes payload;
        uint256 windowEnd;
        bool isValid;
        uint yesTotal;
        uint noTotal;
        mapping(address => uint) yesVotesOf;
        mapping(address => uint) noVotesOf;
        bool hasBeenApproved;
    }

    function unblockTransfer() public {
        for(uint i=0; i < inVote[msg.sender].length; i++){
            Modification storage m = modifications[i];
            m.noTotal -= m.noVotesOf[msg.sender];
            m.noVotesOf[msg.sender] = 0;
            m.yesTotal -= m.yesVotesOf[msg.sender];
            m.yesVotesOf[msg.sender] = 0;
        }
        delete inVote[msg.sender];
    }

    modifier inVoteWindow(uint256 _id) {
        require(now < modifications[_id].windowEnd);
        _;
    }

    function voteOnModification(uint256 _id, bool _approve)
        inVoteWindow(_id)
    public {
        Modification storage m = modifications[_id];
        if(_approve){
            m.noTotal -= m.noVotesOf[msg.sender];
            m.noVotesOf[msg.sender] = 0;
            m.yesVotesOf[msg.sender] = balances[msg.sender];
            m.yesTotal += balances[msg.sender];
        } else {
            m.yesTotal -= m.yesVotesOf[msg.sender];
            m.yesVotesOf[msg.sender] = 0;
            m.noVotesOf[msg.sender] = balances[msg.sender];
            m.noTotal += balances[msg.sender];
        }
        m.isValid = m.yesTotal > m.noTotal;
        inVote[msg.sender].push(_id);
    }

    function confirmModifications(uint256 _id) public {
        Modification storage m = modifications[_id];
        require(now > m.windowEnd);
        require(m.isValid);
        require(!m.hasBeenApproved);
        m.hasBeenApproved = true;
        // confirmation logic goes here
    }
}
