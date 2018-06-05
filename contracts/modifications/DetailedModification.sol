pragma solidity ^0.4.23;

import "./GenericModification.sol";

contract DetailedModification is GenericModification {
    constructor(uint256 _window, uint256 _totalSupply) public {
        windowSize = _window;
        balances[msg.sender] = _totalSupply;
    }

    event ModificationCreated(
        bytes32 indexed signature,
        bytes payload,
        uint256 indexed windowEnd,
        uint256 indexed id,
        bytes32 detailsHash
    );

    function createModification(bytes32 _sig, bytes _payload, bytes32 _hash)
    public returns(uint256){
        uint256 _id = modifications.length++;
        Modification storage m = modifications[_id];
        m.signature = _sig;
        m.payload = _payload;
        m.windowEnd = now + windowSize;
        emit ModificationCreated(_sig, _payload, m.windowEnd, _id, _hash);
        return _id;
    }
}
