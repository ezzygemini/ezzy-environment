const Environment = require('./src/Environment');
const logger = require('logger').logger;

/** @type {Environment} */
const environment = new Environment();

module.exports = environment;

logger.info({title: 'Environment', message: environment});
