const Environment = require('./Environment');
const environment = new Environment();

describe('Environment', () => {

  it('should have the necessary properties available', () => {
    expect(environment.development).toBe(false);
    expect(environment.alpha).toBe(false);
    expect(environment.beta).toBe(false);
    expect(environment.gamma).toBe(false);
    expect(environment.production).toBe(true);
  });

});
