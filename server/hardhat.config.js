require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    ganache: {
      chainId: 1337, // Ganache chain ID
      url: "http://127.0.0.1:7545", // Ganache RPC server endpoint
    },
  },
};
