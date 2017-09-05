const Environment = require('./src/Environment');
const {logger} = require('ezzy-logger');

const environment = Environment.inst;
logger.info({title: 'Environment', message: environment});
module.exports = environment;
