pragma solidity ^0.4.23;

import "../GenericModification.sol";

contract WindowedThreshold is GenericModification {
    uint256 approvalThreshold;

    modifier inVoteWindow(uint256 _id) {
        require(now < modifications[_id].windowEnd);
        _;
    }

    function voteOnModification(uint256 _id, bool _approve)
        inVoteWindow(_id)
    public {
        Modification storage m = modifications[_id];
        accountVotes(_id, _approve);
        m.isValid = m.yesTotal >= approvalThreshold;
        inVote[msg.sender].push(_id);
    }
}
