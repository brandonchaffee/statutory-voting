var StatutoryVoting = artifacts.require("./StatutoryVoting.sol");

module.exports = function(deployer) {
    deployer.deploy(StatutoryVoting);
};
