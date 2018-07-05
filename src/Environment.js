let pkg;
try {
  pkg = require('../../../package.json');
} catch (e) {
  pkg = null;
}
const argument = require('ezzy-argument');
const path = require('path');
const deepmerge = require('deepmerge');
const logger = require('ezzy-logger').logger;
let inst;

const DEVELOPMENT = 'development';
const TEST = 'test';
const ALPHA = 'alpha';
const BETA = 'beta';
const GAMMA = 'gamma';
const PRODUCTION = 'production';
const DELTA = 'delta';

/**
 * Environment
 */
class Environment {

  /**
   * Constructor.
   */
  constructor() {

    const json = JSON.stringify(process.env);
    if (json !== '{}' && !process.env.HIDE_ARGUMENTS) {
      console.log(`[PROCESS] ${json}`);
    }

    // Look for a variable in our arguments
    let env = process.env.NODE_ENV || process.env.ENVIRONMENT ||
      argument(['ENVIRONMENT', 'NODE_ENV'], 'production');

    // Sometimes the argument is just passed as --production
    const prodArg = argument('PRODUCTION', null);
    if (prodArg && prodArg !== 'false') {
      env = 'production';
    }

    // Set the environment.
    this.setEnvironment(env);

    /**
     * The application port.
     * @type {number}
     */
    this.port = parseFloat(argument('PORT', 9000));

    /**
     * The application port.
     * @type {number}
     */
    this.httpsPort = parseFloat(argument('HTTPS_PORT', this.port + 1));

    /**
     * Cache of entries.
     * @type {Object}
     * @private
     */
    this._cache = {
      [PRODUCTION]: {},
      [DEVELOPMENT]: {},
      [TEST]: {},
      [ALPHA]: {},
      [BETA]: {},
      [GAMMA]: {},
      [PRODUCTION]: {},
      [DELTA]: {},
    };
  }

  /**
   * Sets the environment.
   * @param env
   */
  setEnvironment(env) {
    /**
     * If environment is in development.
     * @type {boolean}
     */
    this.development = env.indexOf('dev') > -1;

    /**
     * Shortcut to development property.
     * @type {boolean}
     */
    this.dev = this.development;

    /**
     * If environment is in testing.
     * @type {boolean}
     */
    this.test = env.indexOf('test') > -1;

    /**
     * Shortcut to testing property.
     * @type {boolean}
     */
    this.testing = this.test;

    /**
     * If environment is in alpha.
     * @type {boolean}
     */
    this.alpha = env === 'alpha';

    /**
     * If environment is in beta.
     * @type {boolean}
     */
    this.beta = env === 'beta';

    /**
     * If environment is in gamma.
     * @type {boolean}
     */
    this.gamma = env === 'gamma';

    /**
     * If environment is in delta.
     * @type {boolean}
     */
    this.delta = env === 'delta';

    /**
     * Checks if we should be using ports when calling domains.
     * @type {boolean}
     */
    this.usePorts = this.dev || this.test;

    /**
     * The environment name.
     */
    if (this.dev) {
      this.name = DEVELOPMENT;
    } else if (this.test) {
      this.name = TEST;
    } else if (this.alpha) {
      this.name = ALPHA;
    } else if (this.beta) {
      this.name = BETA;
    } else if (this.gamma) {
      this.name = GAMMA;
    } else if (this.delta) {
      this.name = DELTA;
    } else {
      this.name = PRODUCTION;
    }

    /**
     * Specifies the node modules path.
     */
    this.nodeModules = path.normalize(__dirname + '/../../');

    /**
     * If environment is in production
     * @type {boolean}
     */
    this.production = !this.development && !this.alpha &&
      !this.beta && !this.gamma && !this.test && !this.delta;
  }

  /**
   * Default instance of the environment.
   * @returns {Environment}
   */
  static get inst() {
    if (!inst) {
      inst = new Environment();
    }
    return inst;
  }

  /**
   * Sets an environment property.
   * @param {string} key The key to set.
   * @param {*} value The value of the environment.
   */
  set(key, value) {
    this[key] = value;
  }

  /**
   * Gets an environment property.
   * @param {string} key The key to get.
   * @param {*} defaultValue The default value to return if undefined.
   * @returns {*}
   */
  get(key, defaultValue) {
    return this[key] || defaultValue;
  }

  /**
   * Simple exposure of the argument.
   * @param {*} args The arguments to be passed.
   * @returns {*}
   */
  argument(...args) {
    return argument.apply(this, args);
  }

  /**
   * Gets configuration from the package.json and overrides depending on
   * environment.
   * @example
   * {
   *  "prop": { "a":true },
   *  "development": {
   *    "prop":{ "a":false }
   *  }
   * }
   * environment.configuration('prop').a = false; // development
   * environment.configuration('prop').a = true; // every other environment
   *
   * @param {string} scope The scope to look for.
   * @param {Object} defaultConfig The default configuration if none is found.
   * @param {string} env The environment where to pull the config.
   * @returns {*|Object}
   */
  getConfiguration(scope, defaultConfig = {}, env) {
    env = env || this.name;

    if (!this._cache[env]) {
      throw new Error(`We couldn't find an environment called "${env}".`);
    } else if (this._cache[env][scope]) {
      return this._cache[env][scope];
    }

    let configuration = pkg || defaultConfig;
    const scopes = scope.split('.');
    const namespace = scopes.shift();
    const subScopes = scopes.join('.');

    if (env !== this.name) {
      logger.warn({
        title: 'Configuration',
        message: 'You\'re accessing a configuration from a ' +
        'different environment. Was this is intended?',
        data: {
          currentEnvironment: this.name,
          environmentRequested: env,
          scope
        }
      })
    }

    const envConfig = configuration[env] ||
      configuration[`_${env}`] ||
      configuration[env.toUpperCase()];
    if (typeof envConfig === 'object') {
      configuration = deepmerge(configuration, envConfig);
    }

    const argConfig = argument(['configuration', 'package'], undefined);
    if (argConfig) {
      try {
        configuration = deepmerge(configuration, JSON.parse(argConfig));
      } catch (e) {
        logger.error({
          title: 'Configuration',
          message: `The configuration provided isn't a valid json string.`,
          error: e
        });
      }
    }

    let config = configuration[namespace] || configuration[`_${namespace}`];
    if (!config) {
      logger.error(`The namespace you requested is undefined: ${scope}`);
      return;
    }

    const subEnvConfig = config[env] ||
      config[`_${env}`] ||
      config[env.toUpperCase()];
    if (subEnvConfig) {
      config = deepmerge(config, subEnvConfig);
    }

    if (subScopes.length) {
      config = eval(`config.${scopes.join('.')}`);
    }

    this._cache[env][scope] = config;

    logger.debug('Environment Configuration', scope, config);

    return config;
  }

}

module.exports = Environment;
