// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'


import voting_artifacts from '../../build/contracts/Voting.json'

var Voting = contract(voting_artifacts);

let candidates = {}

let tokenPrice = null;

window.voteForCandidate = function(candidate) {
  let candidateName = $("#candidate").val();
  let voteTokens = $("#vote-tokens").val();

  try {
    $("#msg").html("Vote has been submitted. The vote count will increment as soon as the vote is recorded on the blockchain. Please wait.");
    $("#candidate").val("");
    $("#vote-tokens").val("");

    Voting.deployed().then(function(contractInstance){
      contractInstance.voteForCandidate(candidateName, voteTokens, {gas: 140000, from: web3.eth.accounts[0]}).then(function(){
        let candidateId = candidates[candidateName];
        return contractInstance.totalVotesFor.call(candidateName).then(function(v){
          $("#" + candidateId).html(v.toString() + "<span id='" + candidateId + "-vote-count' class='text-success'></span>");
          $("#msg").html("");
          refreshVoterInfo();
        });
      });
    });
  } catch (err){
    console.log(err);
  }
}

$(document).ready(function(){
  if(typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source like MetaMask");
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. Remove this fallback and use MetaMask for production.");
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));    
  }

  Voting.setProvider(web3.currentProvider);

  populateCandidates();
});

function populateCandidates() {
  Voting.deployed().then(function(contractInstance){
    contractInstance.allCandidates.call().then(function(candidateArray){
      for(let i = 0; i < candidateArray.length; i++){
        candidates[web3.toUtf8(candidateArray[i])] = "candidate-" + i;
      }

      setupCandidateRows();
      populateCandidateVotes();
      populateTokenData();
    });
  });
}

function setupCandidateRows(){
  Object.keys(candidates).forEach(function(candidate){
    $("#candidate-rows").append("<tr><td>" + candidate + "</td><td id='" + candidates[candidate] + "'></td></tr>");
  });
}

function populateCandidateVotes(){
  let candidateNames = Object.keys(candidates);
  for(var i = 0; i < candidateNames.length; i++) {
    let name = candidateNames[i];
    Voting.deployed().then(function(contractInstance){
      contractInstance.totalVotesFor.call(name).then(function(v){
        $("#" + candidates[name]).html(v.toString() + "<span id='" + candidates[name] + "-vote-count' class='text-success'></span>");
      });
    });
  }
}

function populateTokenData() {
  Voting.deployed().then(function(contractInstance){
    contractInstance.totalTokens().then(function(v) {
          $("#tokens-total").html(v.toString());
        });
        contractInstance.tokensSold.call().then(function(v) {
          $("#tokens-sold").html(v.toString());
        });
        contractInstance.tokenPrice().then(function(v) {
          tokenPrice = parseFloat(web3.fromWei(v.toString()));
          $("#tokens-cost").html(tokenPrice + " Ether");
        });
        web3.eth.getBalance(contractInstance.address, function(error, result) {
          $("#contract-balance").html(web3.fromWei(result.toString()) + " Ether");
        });
  });
  refreshVoterInfo();
}

function refreshVoterInfo() {
  Voting.deployed().then(function(contractInstance) {
    contractInstance.voterDetails.call(web3.eth.accounts[0]).then(function(v) {

      // load voters total tokens bought count
      let totalTokensBought = v[0];
      let votesPerCandidate = v[1];
      $("#tokens-bought").html("Tokens bought: " + totalTokensBought.toString());
      let allCandidates = Object.keys(candidates);
      let remainingVotes = totalTokensBought;

      // calculate votes per candidate
      for(let i=0; i < allCandidates.length; i++) {
        $("#candidate-" + i + "-vote-count").html(" (&#8593;" + votesPerCandidate[i].toString() + ")");
        remainingVotes -= votesPerCandidate[i];
      }
      $("#votes-remaining").html("Tokens Remainaing: " + remainingVotes);
    });
  });
}

window.buyTokens = function() {
  let tokensToBuy = $("#buy").val();
  let price = tokensToBuy * tokenPrice;
  $("#buy-msg").html("Purchase order has been submitted. Please wait.");
  Voting.deployed().then(function(contractInstance) {
    contractInstance.buy({value: web3.toWei(price, 'ether'), from: web3.eth.accounts[0]}).then(function(v) {
      $("#buy-msg").html("");
      web3.eth.getBalance(contractInstance.address, function(error, result) {
        populateTokenData();
        $("#buy").val("");
      });
    })
  });
}
