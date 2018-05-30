var StatutoryVoting = artifacts.require("./StatutoryVoting.sol");

module.exports = function(deployer) {
    const votingWindow = 4000;
    const supply = 100000000;
    deployer.deploy(StatutoryVoting, votingWindow, supply);
};
