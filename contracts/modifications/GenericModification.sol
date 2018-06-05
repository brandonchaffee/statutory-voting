pragma solidity ^0.4.23;

import "../BlockableTransfer.sol";

contract GenericModification is BlockableTransfer {
    Modification[] public modifications;

    struct Modification {
        bytes4 signature;
        bytes32[] payload;
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
        callModification(m);
    }

    function callModification(Modification m) internal {
        bytes4 sig = m.signature;
        bytes32[] memory payload = m.payload;
        assembly {

            let len := mload(payload)
            let data := add(payload, 0x20)

            let mPointer := mload(0x40)
            mstore(mPointer,sig)

            let offset := 0x04
            for { let i := 0 } lt(i, len) {
                i:= add(i, 1)
                offset := add(offset, 0x20)
                data := add(data, 0x20)
            }{
                mstore(add(mPointer,offset),mload(data))
            }

            let success := call(5000, address, 0, mPointer, msize, mPointer, 0x20)

            mstore(0x40,add(mPointer,msize))
        }
    }
}
