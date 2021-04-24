import React, { useEffect, useState } from 'react'
import Web3 from 'web3'
import DaiToken from '../abis/DaiToken.json'
import DappToken from '../abis/DappToken.json'
import TokenFarm from '../abis/TokenFarm.json'
import Main from './Main'
import Navbar from './Navbar'
import './App.css'

export default function App() {
  const [account, setAccount] = useState('0x0');
  const [daiToken, setDaiToken] = useState({});
  const [daiTokenBalance, setDaiTokenBalance] = useState('0');
  const [dappToken, setDappToken] = useState({});
  const [dappTokenBalance, setDappTokenBalance] = useState('0');
  const [loading, setLoading] = useState(true);
  const [stakingBalance, setStakingBalance] = useState('0');
  const [tokenFarm, setTokenFarm] = useState({});

  /**
   * @description Effect for loading app 
   */
  useEffect(() => {
    (async function() {
      await loadWeb3();
      await loadBlockchainData();
    })();
  }, []);

  /**
   * @description Helper function used to stake tokens
   * @param {Number} amount
   */
  function stakeTokens(amount) {
    setLoading(true)
    daiToken.methods.approve(tokenFarm._address, amount).send({ from: account }).on('transactionHash', (hash) => {
      tokenFarm.methods.stakeTokens(amount).send({ from: account }).on('transactionHash', (hash) => {
        setLoading(false)
      })
    })
  }
  
  /**
   * @description Helper function used to unstake tokens
   * @param {Number} amount
   */
  function unstakeTokens() {
    setLoading(true)
    tokenFarm.methods.unstakeTokens().send({ from: account }).on('transactionHash', (hash) => {
      setLoading(false)
    })
  }

  /**
   * @description Function used to load the block chain data on page load
   */
  async function loadBlockchainData() {
    const web3 = window.web3

    const [firstAccount] = await web3.eth.getAccounts()
    setAccount(firstAccount)

    const networkId = await web3.eth.net.getId()

    // Load DaiToken
    const daiTokenData = DaiToken.networks[networkId]
    if(daiTokenData) {
      const _daiToken = new web3.eth.Contract(DaiToken.abi, daiTokenData.address)
      setDaiToken(_daiToken)
      let _daiTokenBalance = await _daiToken.methods.balanceOf(firstAccount).call()
      setDaiTokenBalance(_daiTokenBalance.toString())
    } else {
      window.alert('DaiToken contract not deployed to detected network.')
    }

    // Load DappToken
    const dappTokenData = DappToken.networks[networkId]
    if(dappTokenData) {
      const _dappToken = new web3.eth.Contract(DappToken.abi, dappTokenData.address)
      setDappToken(_dappToken)
      let _dappTokenBalance = await _dappToken.methods.balanceOf(firstAccount).call()
      setDappTokenBalance(_dappTokenBalance.toString())
    } else {
      window.alert('DappToken contract not deployed to detected network.')
    }

    // Load TokenFarm
    const tokenFarmData = TokenFarm.networks[networkId]
    if(tokenFarmData) {
      const _tokenFarm = new web3.eth.Contract(TokenFarm.abi, tokenFarmData.address)
      setTokenFarm(_tokenFarm)
      let _stakingBalance = await _tokenFarm.methods.stakingBalance(firstAccount).call()
      setStakingBalance(_stakingBalance.toString())
    } else {
      window.alert('TokenFarm contract not deployed to detected network.')
    }

    setLoading(false)
  }

  /**
   * @description Function used to load web 3
   */
  function loadWeb3() {
    return new Promise((resolve, reject) => {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum)
        window.ethereum.enable().then(() => resolve());
      } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider)
        resolve();
      } else {
        window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
        reject();
      }
    });
  }

  return (
    <div>
      <Navbar account={account} />
      <div className="container-fluid mt-5">
        <div className="row">
          <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
            <div className="content mr-auto ml-auto">
              <a
                href="http://www.dappuniversity.com/bootcamp"
                target="_blank"
                rel="noopener noreferrer"
              >
              </a>

              {
                !loading ?
                  <Main
                    daiTokenBalance={daiTokenBalance}
                    dappTokenBalance={dappTokenBalance}
                    stakingBalance={stakingBalance}
                    stakeTokens={stakeTokens}
                    unstakeTokens={unstakeTokens}
                  /> :
                  <Loading/>
              }

            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div>Loading...</div>
  );
}