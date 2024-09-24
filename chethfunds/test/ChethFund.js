const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('ChethFund', function () {
    let ChethFund;
    let chethFund;
    let owner;
    let addr1;
    let addr2;
    let addr3;
    let addr4;
    let treasurer;
    const memberSize = 3;
    const chitAmount = ethers.parseUnits('1', 'ether') // 1 ether

    beforeEach(async function () {
        [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();

        // Deploy the contract
        const ChethFundFactory = await ethers.getContractFactory('ChethFund');
        chethFund = await ChethFundFactory.deploy(memberSize, chitAmount);
        // await chethFund.deployed();
        // Set the treasurer to the correct address (from constructor)
        // await chethFund.connect(owner).transferOwnership(treasurer.address); 
    });

    describe('Deployment', function () {
        it('Should set the correct contract manager', async function () {
            expect(await chethFund.contractManager()).to.equal(owner.address);
        });

        it('Should set the correct member size and chit amount', async function () {
            expect(await chethFund.memberSize()).to.equal(memberSize);
            expect(await chethFund.chitAmount()).to.equal(chitAmount);
        });

        it('Should set the correct remaining months', async function () {
            expect(await chethFund.remainingMonths()).to.equal(memberSize);
        });

        it('Should set the contract as active', async function () {
            expect(await chethFund.contractActive()).to.equal(true);
        });
    });

    describe('Deposit Chit', function () {
        it('Should allow members to deposit the correct chit amount', async function () {
            await chethFund.connect(addr1).depositChit({ value: chitAmount });
            expect(await chethFund.paidMembers(addr1.address)).to.equal(true);
        });

        it('Should reject deposits with incorrect chit amount', async function () {
            await expect(
                chethFund.connect(addr1).depositChit({ value: ethers.parseUnits('0.5', 'ether') })
            ).to.be.revertedWith('DEPOSIT_MISMATCH');
        });

        it('Should reject double deposits from the same member', async function () {
            await chethFund.connect(addr1).depositChit({ value: chitAmount });
            await expect(
                chethFund.connect(addr1).depositChit({ value: chitAmount })
            ).to.be.revertedWith('ALREADY_DEPOSITED');
        });

        it('Should reject deposits after member limit is reached', async function () {
            await chethFund.connect(addr1).depositChit({ value: chitAmount });
            await chethFund.connect(addr2).depositChit({ value: chitAmount });
            await chethFund.connect(addr3).depositChit({ value: chitAmount });

            await expect(
                chethFund.connect(addr4).depositChit({ value: chitAmount })
            ).to.be.revertedWith('MAX_MEMBERS_REACHED');
        });
    });

    describe('Bidding', function () {
        beforeEach(async function () {
            await chethFund.connect(addr1).depositChit({ value: chitAmount });
            await chethFund.connect(addr2).depositChit({ value: chitAmount });
            await chethFund.connect(addr3).depositChit({ value: chitAmount });
        });

        it('Should allow bidding with amount higher than the current bid', async function () {
            const bidAmount = ethers.parseUnits('0.5', 'ether');
            await chethFund.connect(addr1).bid(bidAmount);

            expect(await chethFund.currentBidAmount()).to.equal(bidAmount);
            expect(await chethFund.currentBeneficiary()).to.equal(addr1.address);
        });

        it('Should reject bids lower than the current bid', async function () {
            const bidAmount = ethers.parseUnits('0.5', 'ether');
            await chethFund.connect(addr1).bid(bidAmount);

            await expect(
                chethFund.connect(addr2).bid(ethers.parseUnits('0.4', 'ether'))
            ).to.be.revertedWith('BID_VALUE_LESS_THAN_CURRENTBID');
        });
    });

    describe('Distributing Funds', function () {
        beforeEach(async function () {
            await chethFund.connect(addr1).depositChit({ value: chitAmount });
            await chethFund.connect(addr2).depositChit({ value: chitAmount });
            await chethFund.connect(addr3).depositChit({ value: chitAmount });
            await chethFund.connect(addr1).bid(ethers.parseUnits('0.5', 'ether'));
        });

        it('Should distribute funds correctly', async function () {
            const initialBalance = await ethers.provider.getBalance(addr1.address);
            await chethFund.connect(owner).distributeFunds();
            const newBalance = await ethers.provider.getBalance(addr1.address);

            expect(newBalance).to.be.gt(initialBalance); // Beneficiary received funds

            const remainingMonths = await chethFund.remainingMonths();
            expect(remainingMonths).to.equal(memberSize - 1); // One month passed

            expect(await chethFund.contractActive()).to.equal(true); // Contract still active
        });

        it('Should only allow the contract manager to distribute funds', async function () {
            await expect(
                chethFund.connect(addr1).distributeFunds()
            ).to.be.revertedWith('NOT_ALLOWED');
        });
    });
});
