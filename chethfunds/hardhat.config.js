require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/ThmK5GMa8cPgR5Sw9eLn4GhoFI5_51tM"
    }
  }
};
