const Environment = require('./src/Environment');
const environment = Environment.inst;

environment.config = (...args) => environment.getConfiguration(...args);
environment.argument = (...args) => environment.getArgument(...args);

module.exports = environment;
