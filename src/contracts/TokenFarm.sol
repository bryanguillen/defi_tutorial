pragma solidity ^0.5.0; // declare the language and version

import "./DaiToken.sol";
import "./DappToken.sol";

/**
 * This smart contract's responsibility is to allow
 * the user to deposit mock DAI tokens, gain interest (issue DAPP
 * tokens), and finally, allow user to withdraw to wallet.
 */
contract TokenFarm {
  /**
   *  public means that this variable will be exposed on the block chain,
   * which means we can access outside of this smart contract
   */
  string public name = "Dapp Token Farm";
  DappToken public dappToken;
  DaiToken public daiToken;
  address[] public stakers; // need to keep track of this to issue rewards later 
  mapping(address => uint) public stakingBalance;
  mapping(address => bool) public hasStaked;
  mapping(address => bool) public isStaking;
  address public owner;

  /**
   * function that gets run once, whenever the code gets deployed to the block chain
   * note: the parameters are the addresses for each of the tokens
   */
  constructor(DappToken _dappToken, DaiToken _daiToken) public {
    dappToken = _dappToken;
    daiToken = _daiToken;
    owner = msg.sender;
  }

  /**
   * Staking Tokens (Deposit)
   * The core functionality here is to allow the investor
   * to transfer tokens to this smart contract
   */
  function stakeTokens(uint _amount) public {
    /**
     * require that user has a balance
     */
    require(_amount > 0, "amount cannot be zero");
    
    /**
     * - The API comes from the source (check it out)
     * - msg: a special global variable w/ Solidity
     * - address(this): extract address for smart contract to get to
     * - amount: the amount to transfer
     */
    daiToken.transferFrom(msg.sender, address(this), _amount);

    /**
     * Update staking balance
     */
    stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

    /**
     * Add users to stakers array, if they have not been added yet
     */
    if (!hasStaked[msg.sender]) {
      stakers.push(msg.sender);
    }

    /**
     * Update staking status 
     */
    hasStaked[msg.sender] = true;
    isStaking[msg.sender] = true;
  }

  /**
   * Unstaking Tokens (Withdraw)
   * Assumes user will unstake all
   */
  function unstakeTokens() public {
    uint balance = stakingBalance[msg.sender];
    
    require(balance > 0, "staking balance cannot be 0");

    daiToken.transfer(msg.sender, balance);

    stakingBalance[msg.sender] = 0;
    isStaking[msg.sender] = false;
  }

  /**
   * Issue Tokens
   */
  function issueTokens() public {
    /**
     * Ensure owner is only person that can issue tokens
     */
    require(msg.sender == owner, "caller must be the owner");

    /**
     * Issue tokens to all stakers
     */
    for (uint i=0; i < stakers.length; i++) {
      address recipient = stakers[i];
      uint balance = stakingBalance[recipient];
      if (balance > 0) {
        dappToken.transfer(recipient, balance);
      }
    }
  }
}