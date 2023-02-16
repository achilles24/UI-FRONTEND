const { printf } = require("../util");

function main({ config }) {
  function dumpConfig(done) {
    printf("%4j", config);
    done();
  }

  return { "dump:config": dumpConfig };
}

module.exports = main;
