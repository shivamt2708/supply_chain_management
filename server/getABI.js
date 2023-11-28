const fs = require('fs');
const path = require('path');

async function getContractABI() {
  const contractName = 'ShipmentContract'; // Replace with your contract's name
  const artifactsPath = path.join(__dirname, 'artifacts');
  const abiPath = path.join(artifactsPath, `${contractName}.json`);

  try {
    const abiFile = fs.readFileSync(abiPath, 'utf-8');
    const abi = JSON.parse(abiFile).abi;
    console.log(abi);
  } catch (error) {
    console.error(`Error reading ABI file: ${error.message}`);
  }
}

getContractABI();