let pkg;
try {
  pkg = require('../../../package.json');
} catch (e) {
  pkg = null;
}
const argument = require('ezzy-argument');
const path = require('path');
const deepmerge = require('deepmerge');
let inst;

/**
 * Environment
 */
class Environment {

  /**
   * Constructor.
   */
  constructor() {

    const json = JSON.stringify(process.env);
    if (json !== '{}') {
      console.log(`[PROCESS] ${json}`);
    }

    // Look for a variable in our arguments
    let env = argument(['ENVIRONMENT', 'NODE_ENV'], 'production');

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
    this.port = argument('PORT', 9000);

    /**
     * Cache of entries.
     * @type {Object}
     * @private
     */
    this._cache = {};

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
     * The environment name.
     */
    if (this.dev) {
      this.name = 'development';
    } else if (this.test) {
      this.name = 'test';
    } else if (this.alpha) {
      this.name = 'alpha';
    } else if (this.beta) {
      this.name = 'beta';
    } else if (this.gamma) {
      this.name = 'gamma';
    } else {
      this.name = 'production';
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
      !this.beta && !this.gamma && !this.test;
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
  set (key, value) {
    this[key] = value;
  }

  /**
   * Gets an environment property.
   * @param {string} key The key to get.
   * @param {*} defaultValue The default value to return if undefined.
   * @returns {*}
   */
  get (key, defaultValue) {
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
   * @returns {*|Object}
   */
  getConfiguration(scope, defaultConfig = {}) {
    if (this._cache[scope]) {
      return this._cache[scope];
    }

    let configuration = pkg || defaultConfig;
    const scopes = scope.split('.');
    const namespace = scopes.shift();
    const subScopes = scopes.join('.');

    if (typeof configuration[this.name] === 'object') {
      configuration = deepmerge(configuration, configuration[this.name]);
    }

    let config = configuration[namespace] || configuration[`_${namespace}`];

    if (typeof config === 'object' && typeof config[this.name] === 'object') {
      config = deepmerge(config, config[this.name]);
    }

    if (subScopes.length) {
      config = eval(`config.${scopes.join('.')}`);
    }

    this._cache[scope] = config;

    return config;
  }

}

module.exports = Environment;
