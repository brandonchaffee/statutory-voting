pragma solidity ^0.4.23;

import 'openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol';

contract StatutoryVoting is StandardToken {
    mapping(address => bool) transferBlocked;
    Proposal[] public proposals;
    uint256 windowSize;

    struct Proposal {
        address target;
        uint256 windowEnd;
        bool isValid;
        uint yesTotal;
        uint noTotal;
        mapping(address => uint) yesVotesOf;
        mapping(address => uint) noVotesOf;
    }

    constructor(uint256 _window, uint256 _totalSupply) public {
        windowSize = _window;
        balances[msg.sender] = _totalSupply;
    }

    //Transfer Functionality
    modifier validTransfer() {
        require(!transferBlocked[msg.sender]);
        _;
    }

    function transfer(address _to, uint256 _value)
        validTransfer()
    public returns (bool) {
        require(_to != address(0));
        require(_value <= balances[msg.sender]);

        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value)
        validTransfer()
    public returns (bool) {
        require(_to != address(0));
        require(_value <= balances[_from]);
        require(_value <= allowed[_from][msg.sender]);

        balances[_from] = balances[_from].sub(_value);
        balances[_to] = balances[_to].add(_value);
        allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
        emit Transfer(_from, _to, _value);
        return true;
    }

    function unblockTransfer() public {

    }

    //Voting & Proposal Functionality
    modifier inVoteWindow(uint256 _id) {
        require(now < proposals[_id].windowEnd);
        _;
    }


}
