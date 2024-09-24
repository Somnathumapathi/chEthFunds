const { ethers } = require('hardhat');

async function main() {
    // Specify the parameters for deployment
    const memberSize = 3; // Change as needed
    const chitAmount = ethers.utils.parseUnits('1', 'ether'); // 1 ether

    // Get the contract factory
    const ChethFundFactory = await ethers.getContractFactory('ChethFund');

    // Deploy the contract
    const chethFund = await ChethFundFactory.deploy(memberSize, chitAmount);

    // Wait for the deployment to complete
    await chethFund.deployed();

    console.log(`ChethFund deployed to: ${chethFund.address}`);
}

// Error handling
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });