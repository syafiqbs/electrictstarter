//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Fundraise.sol";

contract Crowdfund{
    event FundraiseStarted(
        address contractAddress,
        address creator,
        uint256 minContribution,
        uint256 DEADLINE,
        uint256 targetAmount,
        uint256 currentAmount,
        uint256 noOfContributors,
        string TITLE,
        string DESC,
        uint256 currentState
    );

    event contributionReceived(
        address fundraiseAddress,
        uint256 contributionAmount,
        address indexed contributor
    );

    Fundraise[] private fundraises;
    
    function createFundraise(uint256 minimumContribution, uint256 deadline, uint256 targetContribution, string memory title, string memory description) public{
        deadline = deadline;
        Fundraise newFundraise = new Fundraise(payable(msg.sender), minimumContribution, targetContribution, title, description, deadline);
        fundraises.push(newFundraise);
        emit FundraiseStarted(address(newFundraise), msg.sender, minimumContribution, deadline, targetContribution, 0, 0, title, description, 0);
    }

    function returnFundraises() external view returns(Fundraise[] memory){
        return fundraises;
    }

    function contribute(address _fundraiseAddress) public payable{
        uint256 minContributionAmt = Fundraise(_fundraiseAddress).minimumContribution();
        Fundraise.State fundraiseState = Fundraise(_fundraiseAddress).state();
        require(fundraiseState == Fundraise.State.Ongoing, "Invalid state");
        require(msg.value >= minContributionAmt, "Contribution amount is not sufficient");
        Fundraise(_fundraiseAddress).contribute{value:msg.value}(msg.sender);
        // emit ReceivedContribution(_fundraiseAddress, msg.value, msg.sender);
    }
}