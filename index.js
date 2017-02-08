const Environment = require('./src/Environment');
const logger = require('../utils/logger');

/** @type {Environment} */
const environment = new Environment();

module.exports = environment;

logger.info({title: 'Environment', message: environment});
