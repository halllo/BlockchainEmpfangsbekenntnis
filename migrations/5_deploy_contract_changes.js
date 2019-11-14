const Empfangsbekenntnis = artifacts.require("Empfangsbekenntnis");

module.exports = function(deployer) {
  deployer.deploy(Empfangsbekenntnis);
};
