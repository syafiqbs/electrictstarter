//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../node_modules/@openzeppelin/contracts/utils/Strings.sol";
import "../node_modules/@openzeppelin/contracts/security/PullPayment.sol";

contract Fundraise is ReentrancyGuard{
    
    // Variables
    uint256 public remainingTime;
    uint256 public deadline;
    uint256 public currentContribution;
    uint256 public minimumContribution;
    uint256 public targetContribution;
    uint32 public remainingContribution;
    string public title;
    string public description;
    address payable public fundraiser;
    address[] public CONTRIBUTORS;
    State public state = State.Ongoing;

    // Mapping 
    mapping (address => uint256) public contributions;

    // Enums
    enum State {
        NotStarted,
        Ongoing, 
        Unsuccessful, 
        Successful
    }
    

    // Events
    event ReceivedContribution(address contributor, uint amount, uint currentTotal);
    event FundraiseSuccessful(uint256 timestamp, uint currentTotal, uint contributors);
    event FundraiseUnsuccessful(uint256 timestamp, uint currentTotal, uint contributors);
    event withdrawFund(uint256 timestamp, uint256 value, string description);

    // Modifiers
    modifier isFundraiser(){
        require(msg.sender == fundraiser, "No access");
        _;
    }

    modifier isOngoing(State _state){
        require(state == _state, "Invalid state");
        require(block.timestamp < deadline, "Fundraise has ended.");
        _;
    }

    // Functions

    // @dev
    // @param
    // @return


    // Create a payable constructor which initializes the contract
    constructor(address payable _fundraiser, uint256 _minimumContribution, uint256 _targetContribution, string memory _title, string memory _description, uint256 _deadline ){
        fundraiser = _fundraiser;
        minimumContribution = _minimumContribution;
        targetContribution = _targetContribution;
        title = _title;
        description = _description;
        deadline = _deadline;
    }

    function contribute(address _contributor) public isOngoing(State.Ongoing) payable{
        require(msg.value >= minimumContribution, "Does not meet minimum contribution");
        if (contributions[_contributor] == 0){
            CONTRIBUTORS.push(_contributor);
        }
        contributions[_contributor] += msg.value;
        currentContribution += msg.value;
        emit ReceivedContribution(_contributor, msg.value, currentContribution);
        checkStatus();
    }

    // @dev Check if target contribution is met or dateline passed

    function checkStatus() internal {
        if (currentContribution >= targetContribution){
            state = State.Successful;
            // (uint256 timestamp, uint currentTotal, uint contributors)
            emit FundraiseSuccessful(block.timestamp, currentContribution, CONTRIBUTORS.length);
        }
        else if (block.timestamp > deadline){
            state = State.Unsuccessful;
            emit FundraiseUnsuccessful(block.timestamp, currentContribution, CONTRIBUTORS.length);
        }
    }

    function processRefund() public isOngoing(State.Unsuccessful) nonReentrant() returns(bool){
        // check if user is a contributor
        if (contributions[msg.sender] == 0){
            return false;
        }
        else{
            address payable contributor = payable(msg.sender);
            uint256 value = contributions[msg.sender];
            contributions[msg.sender] = 0;
            contributor.transfer(value);
            return true;
        }
    }

    // function withdrawFund(uint256 _value, string _description) public isFundraiser() isOngoing(State.Successful){
    //     fundraiser.transfer(_value);
    // } 

}