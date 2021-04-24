/**
 * @description Script that essentially puts new smart contracts on the blockchain;
 * migrates contract from one place to another.
 */

const DaiToken = artifacts.require('DaiToken')
const DappToken = artifacts.require('DappToken')
const TokenFarm = artifacts.require('TokenFarm')

module.exports = async function(deployer, network, accounts) {
  // Deploy mock DAI
  await deployer.deploy(DaiToken)
  const daiToken = await DaiToken.deployed() // get access to deployed instance
  
  // Deploy DAPP
  await deployer.deploy(DappToken)
  const dappToken = await DappToken.deployed()

  // Deploy Token Farm
  // Note: The second two arguments is what is passed into the constructor
  await deployer.deploy(TokenFarm, dappToken.address, daiToken.address)
  const tokenFarm = await TokenFarm.deployed()

  // Transfer all DAPP tokens to the "bank" -- Token Farm
  await dappToken.transfer(tokenFarm.address, '1000000000000000000000000');

  // Transfer 100 mock DAI tokens to an investor
  // Note: Not really sure how they got this number
  await daiToken.transfer(accounts[1], '100000000000000000000')
}
