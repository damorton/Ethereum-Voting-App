pragma solidity ^0.4.11;

contract Voting {

  struct voter {
    address voterAddress;
    uint tokensBought;
    uint[] tokensUsedPerCandidate;
  }

  mapping (bytes32 => uint) public votesReceived;
  mapping (address => voter) public voterInfo;

  bytes32[] public candidateList;
  uint public totalTokens;
  uint public balanceTokens;
  uint public tokenPrice;

  function Voting(uint tokens, uint pricePerToken, bytes32[] candidateNames){
    candidateList = candidateNames;
    totalTokens = tokens;
    balanceTokens = tokens;
    tokenPrice = pricePerToken;
  }

  function totalVotesFor(bytes32 candidate) constant returns (uint) {
    if(validCandidate(candidate) == false) throw;
    return votesReceived[candidate];
  }

  function voteForCandidate(bytes32 candidate, uint votesInTokens) {
    if(validCandidate(candidate) == false) throw;
    uint index = indexOfCandidate(candidate);
    if(index == uint(-1)) throw;

    if(voterInfo[msg.sender].tokensUsedPerCandidate.length == 0) {
      for (uint i = 0; i < candidateList.length; i++) {
        voterInfo[msg.sender].tokensUsedPerCandidate.push(0);
      }
    }

    uint availableTokens = voterInfo[msg.sender].tokensBought - totalTokensUsed(voterInfo[msg.sender].tokensUsedPerCandidate);
    if(availableTokens < votesInTokens) throw;

    votesReceived[candidate] += votesInTokens;

    voterInfo[msg.sender].tokensUsedPerCandidate[index] += votesInTokens;
  }

  function indexOfCandidate(bytes32 candidate) constant returns (uint) {
    for(uint i = 0; i < candidateList.length; i++){
      if(candidateList[i] == candidate) {
        return i;
      }
    }

    return uint(-1);
  }

  function totalTokensUsed(uint[] _tokensUsedPerCandidate) private constant returns (uint) {
    uint totalUsedTokens = 0;
    for(uint i = 0; i < _tokensUsedPerCandidate.length; i++){
      totalUsedTokens += _tokensUsedPerCandidate[i];
    }
    return totalUsedTokens;
  }

  function validCandidate(bytes32 candidate) returns (bool) {
    for(uint i = 0; i < candidateList.length; i++){
      if(candidateList[i] == candidate){
        return true;
      }
    }
    return false;
  }

  function buy() payable returns (uint) {
    uint tokensToBuy = msg.value / tokenPrice;
    if(tokensToBuy > balanceTokens) throw;
    voterInfo[msg.sender].voterAddress = msg.sender;
    voterInfo[msg.sender].tokensBought += tokensToBuy;
    balanceTokens -= tokensToBuy;
    return tokensToBuy;
  }

  function tokensSold() constant returns (uint) {
    return totalTokens - balanceTokens;
  }

  function voterDetails(address user) constant returns (uint, uint[]) {
    return (voterInfo[user].tokensBought, voterInfo[user].tokensUsedPerCandidate);
  }


  function transferTo(address account) {
    account.transfer(this.balance);
  }

  function allCandidates() constant returns (bytes32[]) {
    return candidateList;
  }
}
