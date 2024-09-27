// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract ChethFund {
    address public contractManager;
    uint public memberSize;
    uint public chitValue;
    // uint public dividend;
    uint public chitAmount;
    uint public remainingMonths;
    bool public contractActive;

    address payable treasurer = payable(0xdD870fA1b7C4700F2BD7f44238821C26f7392148);
    address payable[] public paidMembersList;
    mapping(address => bool) public paidMembers;

    uint public currentBidAmount;
    address payable public currentBeneficiary;

    event ChitDeposited(address indexed member, uint amount);
    event DividendDistributed(uint dividendAmount, uint remainingMonths);
    event ContractClosed();
    event BeneficiaryUpdated(address indexed beneficiary, uint bidAmount);
    event Withdraw(address indexed currentBeneficiary, uint amount);

    constructor (uint _memberSize, uint _chitAmount) {
        contractManager = msg.sender;
        memberSize = _memberSize;
        // chitValue = _chitValue;
        chitAmount = _chitAmount;
        chitValue = chitAmount * memberSize;
        remainingMonths = memberSize;
        contractActive = true;
    }
    
    modifier active() {
        require(contractActive, 'CHETHFUND_INACTIVE');
        _;
    }

    modifier allPaid() {
        require(paidMembersList.length == memberSize, 'NOT_ALL_MEMBERS_PAID');
        _;
    }
    
     function depositChit() public payable active {
        require(msg.value == chitAmount, 'DEPOSIT_MISMATCH');
        require(!paidMembers[msg.sender], 'ALREADY_DEPOSITED');
        require(paidMembersList.length < memberSize, 'MAX_MEMBERS_REACHED');
        
        paidMembers[msg.sender] = true;
        paidMembersList.push(payable(msg.sender));

        emit ChitDeposited(msg.sender, msg.value);
    }

    function bid(uint _bidAmount) public active allPaid {
        require(_bidAmount > currentBidAmount, 'BID_VALUE_LESS_THAN_CURRENTBID');
        currentBidAmount = _bidAmount;
        currentBeneficiary = payable (msg.sender);
        emit BeneficiaryUpdated(msg.sender, _bidAmount);        
    }

    function distributeFunds() public payable active allPaid {
        
        require(msg.sender == contractManager, 'NOT_ALLOWED');

        uint balance = address(this).balance;
        uint commision = balance * 2 / 100;
        uint amtToDistribute = balance - commision;
        // uint amtToBeneficiary = balance - commision - currentBidAmount;        
        // uint dividend = currentBidAmount / memberSize;
        // currentBeneficiary.transfer(amtToBeneficiary);
        // emit Withdraw(currentBeneficiary, amtToBeneficiary);


        treasurer.transfer(commision);

        if (currentBeneficiary == address(0)) {
            uint dividend = amtToDistribute / memberSize;

            for (uint i = 0; i < paidMembersList.length; i++) {
                paidMembersList[i].transfer(dividend);
                paidMembers[paidMembersList[i]] = false;
            }

            emit DividendDistributed(dividend, remainingMonths);

        }  else {

            uint amtToBeneficiary = amtToDistribute - currentBidAmount;
            uint dividend = currentBidAmount / memberSize;

            currentBeneficiary.transfer(amtToBeneficiary);
            emit Withdraw(currentBeneficiary, amtToBeneficiary);

            for (uint i = 0; i < paidMembersList.length; i++) {
                paidMembersList[i].transfer(dividend);
                paidMembers[paidMembersList[i]] = false;
            }

            remainingMonths--;
            emit DividendDistributed(dividend, remainingMonths);
        }

        delete paidMembersList;
        currentBeneficiary = payable(address(0));
        currentBidAmount = 0;


        if(remainingMonths == 0) {
            contractActive = false;
            emit ContractClosed();
        }
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

}