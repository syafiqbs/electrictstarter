//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "hardhat/console.sol";

// [X] Anyone can contribute
// [X] End project if targeted contribution amount reached
// [X] Expire project if raised amount not fullfill between deadline
//    & return donated amount to all contributor .
// [X] Owner need to request contributers for withdraw amount.
// [X] Owner can withdraw amount if 50% contributors agree

contract Project is ReentrancyGuard{

   // Project state
    enum State {
        Ongoing, 
        Unsuccessful,
        Successful
    }

    // Variables
    address payable public creator;
    uint256 public minimumContribution;
    uint256 public deadline;
    uint256 public targetContribution; // required to reach at least this much amount
    uint public completeAt;
    uint256 public raisedAmount; // Total raised amount till now
    uint32 public remainingContribution;
    uint256 public noOfContributers;
    string public projectTitle;
    string public projectDes;
    address[] public CONTRIBUTORS;
    State public state = State.Ongoing; 

    mapping (address => uint) public contributions;

    // Modifiers
    modifier isCreator(){
        require(msg.sender == creator,'You dont have access to perform this operation !');
        _;
    }

    modifier isOngoing(State _state){
        require(state == _state,'Invalid state');
        require(block.timestamp < deadline,'Fundraise has ended!');
        _;
    }

    // Events

    event FundingReceived(address contributor, uint amount, uint currentTotal);
    event FundraiseSuccessful(uint256 timestamp, uint currentTotal, uint contributors);
    event FundraiseUnsuccessful(uint256 timestamp, uint currentTotal, uint contributors);
    event withdrawFund(uint256 timestamp, uint256 value, string description);
    event FundraiserFundWithdraw(uint256 amount, uint256 balance, string details, address destination, uint256 timestamp);

   constructor(
       address _creator,
       uint256 _minimumContribution,
       uint256 _deadline,
       uint256 _targetContribution,
       string memory _projectTitle,
       string memory _projectDes
   ) {
       creator = payable(_creator);
       minimumContribution = _minimumContribution;
       deadline = _deadline;
       targetContribution = _targetContribution;
       projectTitle = _projectTitle;
       projectDes = _projectDes;
       raisedAmount = 0;
   }

    // @dev Anyone can contribute
    // @return null

    function contribute(address _contributor) public isOngoing(State.Ongoing) payable {
        require(msg.value >= minimumContribution,'Does not meet minimum contribution!');
        if(contributions[_contributor] == 0){
            noOfContributers++;
        }
        contributions[_contributor] += msg.value;
        raisedAmount += msg.value;
        emit FundingReceived(_contributor,msg.value,raisedAmount);
        checkStatus();
    }

    // @dev complete or expire funding
    // @return null

    function checkStatus() internal {
        if(raisedAmount >= targetContribution){
            state = State.Successful; 
            emit FundraiseSuccessful(block.timestamp, raisedAmount, CONTRIBUTORS.length);
        } else if(block.timestamp > deadline){
            state = State.Unsuccessful;
            emit FundraiseUnsuccessful(block.timestamp, raisedAmount, CONTRIBUTORS.length);

        }
        completeAt = block.timestamp;
    }

    // @dev Get contract current balance
    // @return uint 

    function getContractBalance() public view returns(uint256){
        return address(this).balance;
    }

    // @dev Request refunt if funding expired
    // @return boolean

    function processRefund() public nonReentrant() returns(bool){
        // Check if user is a contributor AND state is not ongoing or unsuccessful
        if ((uint8(state) == 2) && contributions[msg.sender] == 0){
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

    // @dev Get contract details
    // @return all the project's details

    function getProjectDetails() public view returns(
    address payable projectStarter,
    uint256 minContribution,
    uint256  projectDeadline,
    uint256 goalAmount, 
    uint completedTime,
    uint256 currentAmount, 
    string memory title,
    string memory desc,
    State currentState,
    uint256 balance
    ){
        projectStarter=creator;
        minContribution=minimumContribution;
        projectDeadline=deadline;
        goalAmount=targetContribution;
        completedTime=completeAt;
        currentAmount=raisedAmount;
        title=projectTitle;
        desc=projectDes;
        currentState=state;
        balance=address(this).balance;
    }

    function withdrawSuccessfulFunds(uint256 _amount, string memory _details, address payable _destination) isCreator() public returns(bool){
        require(uint8(state)==2, "Fundraise must be successful for fundraiser to withdraw");
        _destination.transfer(_amount);
        emit FundraiserFundWithdraw(_amount, address(this).balance, _details, _destination, block.timestamp);
        return true;
    }
}