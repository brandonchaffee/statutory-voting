# Statutory Voting

[![Build Status](https://travis-ci.com/brandonchaffee/statutory-voting.svg?branch=master)](https://travis-ci.com/brandonchaffee/statutory-voting)

## About
This is a generic smart contract structure for incorporating a democratic proposal system into ERC20 contracts. The proposal system is based on statutory voting, in which the number of voting rights is proportional to the balance of the individual or entity voting on a proposal. More information can be found [here](https://google.com).


## Dependencies
NodeJS ([installation instruction](https://nodejs.org/en/download/))

## Build and Test
Once NodeJS has been install, run an installation of the project with its proper dependencies. Finally, run the tests on the projects. This will create a personal blockchain using Ganache. Alternatively, the Ganache application can be downloaded [here](https://github.com/trufflesuite/ganache/releases).

```sh
npm install
npm run test
```

If you are using Windows and encounter an error attempting to locate the test script run the following instead:

```sh
npm run test-windows
```
