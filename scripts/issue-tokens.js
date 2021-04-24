const TokenFarm = artifacts.require('TokenFarm')

module.exports = async function(done) {
  const tokenFarm = await TokenFarm.deployed()
  await tokenFarm.issueTokens()

  console.log('Tokens issued')

  done();
}