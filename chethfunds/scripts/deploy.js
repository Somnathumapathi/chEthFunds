const { ethers } = require('hardhat');
const { JsonRpcProvider } = require("ethers");

//0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
const provider = new JsonRpcProvider(process.env.RPC_URL);

async function main() {
    // Specify the parameters for deployment
    // cons(process.env.RPC_URL)
    const memberSize = 3; // Change as needed
    const chitAmount = ethers.parseUnits('1', 'ether'); // 1 ether

    const chainId = await provider.send('eth_chainId', []);
    console.log(`Chain ID: ${chainId}`);
//     const networkName = chainIdToNetworkName[parseInt(chainId, 16)]; // Convert chainId to integer
  console.log(`Network Name: ${(await provider.getNetwork()).name}`);
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