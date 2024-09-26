const { ethers } = require('hardhat');

//0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

async function main() {
    // Specify the parameters for deployment
    const memberSize = 3; // Change as needed
    const chitAmount = ethers.parseUnits('1', 'ether'); // 1 ether

    // Get the contract factory
    const ChethFundFactory = await ethers.getContractFactory('ChethFund');

    // Deploy the contract
    const chethFund = await ChethFundFactory.deploy(memberSize, chitAmount);

    // Wait for the deployment to complete
    // await chethFund.deployed();

    console.log(`ChethFund deployed to: ${chethFund.target}`);
}

// Error handling
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });