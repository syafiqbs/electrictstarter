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
    event FundraiserFundWithdraw(uint256 amount, uint256 balance, string details, address destination, uint256 timestamp);

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



    // @dev Create a payable constructor which initializes the contract
    constructor(address payable _fundraiser, uint256 _minimumContribution, uint256 _targetContribution, string memory _title, string memory _description, uint256 _deadline ){
        fundraiser = _fundraiser;
        minimumContribution = _minimumContribution;
        targetContribution = _targetContribution;
        title = _title;
        description = _description;
        deadline = _deadline;
    }

    // @dev Handle contribute function after meeting minimum amount
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
            emit FundraiseSuccessful(block.timestamp, currentContribution, CONTRIBUTORS.length);
        }
        else if (block.timestamp > deadline){
            state = State.Unsuccessful;
            emit FundraiseUnsuccessful(block.timestamp, currentContribution, CONTRIBUTORS.length);
        }
    }

    // @dev Allows contributor to pull out their funds during ONGOING OR Unsuccessful fundraise
    // @return true or false
    function processRefund() public nonReentrant() returns(bool){
        // Check if user is a contributor AND state is not ongoing or unsuccessful
        if ((uint8(state) == 0 || uint8(state) == 3) && contributions[msg.sender] == 0){
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

    // @returns Return fundraise details
    function getFundraiseDetails() public view returns(
            address payable _creator,
            uint256 _minContribution,
            uint256 _deadline,
            uint256 _targetAmount,
            uint256 _currentAmount,
            string memory _title,
            string memory _description,
            State _currentState,
            uint256 _balance

    ){
        _creator = fundraiser;
        _minContribution = minimumContribution;
        _deadline = deadline;
        _targetAmount = targetContribution;
        _currentAmount = currentContribution;
        _title = title;
        _description = description;
        _currentState = state;
        _balance = address(this).balance;
    }

    // @dev Allows the fundraiser to withdraw funds from contract after successful fundraise
    // @returns boolean
    function withdrawSuccessfulFunds(uint256 _amount, string memory _details, address payable _destination) isFundraiser() public returns(bool){
        require(uint8(state)==3, "Fundraise must be successful for fundraiser to withdraw");
        _destination.transfer(_amount);
        emit FundraiserFundWithdraw(_amount, address(this).balance, _details, _destination, block.timestamp);
        return true;
    }

}