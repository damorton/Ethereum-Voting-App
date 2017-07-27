# Ethereum Voting app

Very good introduction to Ethereum https://medium.com/@mvmurthy/ethereum-for-web-developers-890be23d1d0c

# Notes

- While trying to use truffle to migrate the contracts to the test network using `Geth` there were issues with wallet authentication. Make sure to unlock the default Geth account, check that your new account is stored in `web3.eth.accounts[0]` otherwise it will not be used during the migration. You can delete wallets in the keystore file for your Geth node, this is permanent.
-  Make sure to specify your minimum gas limit, `gas: 210000`, in the `truffle.js` config file. Also set your gas to `gas: 300000` in your `2_deploy_contracts.js` file or a value above the min gas limit set in `truffle.js`.
- You will not see your updated Ether balance until your local Geth node downloads the most up to date block on the network, this can take some time.
- You dont need the test directory for part 2.
- Use tags to navigate the code at different parts of the tutorial.
