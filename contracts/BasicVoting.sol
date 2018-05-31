pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

contract BasicVoting is StandardToken {
    address public approvedTarget;
    mapping(address => uint[]) public currentlyVoted;
    Proposal[] public proposals;
    uint256 public windowSize;

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

    constructor(uint256 _window, uint256 _totalSupply) public {
        windowSize = _window;
        balances[msg.sender] = _totalSupply;
    }

    //Transfer Functionality
    function transfer(address _to, uint256 _value)
    public returns (bool) {
        require(currentlyVoted[msg.sender].length == 0);
        require(_to != address(0));
        require(_value <= balances[msg.sender]);

        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value)
    public returns (bool) {
        require(currentlyVoted[_from].length == 0);
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
        for(uint i=0; i < currentlyVoted[msg.sender].length; i++){
            Proposal storage p = proposals[i];
            p.noTotal -= p.noVotesOf[msg.sender];
            p.noVotesOf[msg.sender] = 0;
            p.yesTotal -= p.yesVotesOf[msg.sender];
            p.yesVotesOf[msg.sender] = 0;
        }
        delete currentlyVoted[msg.sender];
    }

    //Voting & Proposal Functionality
    modifier inVoteWindow(uint256 _id) {
        require(now < proposals[_id].windowEnd);
        _;
    }

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
