pragma solidity ^0.4.23;

import "./GenericModification.sol";

contract SimpleModification is GenericModification {
    event ModificationCreated(
        bytes4 indexed signature,
        bytes32[] payload,
        uint256 indexed windowEnd,
        uint256 indexed id
    );

    function createModification(bytes4 _sig, bytes32[] _payload)
    public returns(uint256){
        uint256 _id = modifications.length++;
        Modification storage m = modifications[_id];
        m.signature = _sig;
        m.payload = _payload;
        m.windowEnd = now + windowSize;
        emit ModificationCreated(_sig, _payload, m.windowEnd, _id);
        return _id;
    }
}
