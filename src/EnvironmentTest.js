const Environment = require('./Environment');
let environment;

describe('Environment', () => {

  beforeEach(() => {
    environment = new Environment();
  });

  it('should have the necessary properties available', done => {
    expect(environment.development).toBe(false);
    expect(environment.alpha).toBe(false);
    expect(environment.beta).toBe(false);
    expect(environment.gamma).toBe(false);
    expect(environment.production).toBe(true);
    done();
  });

  it('should set and get keys properly', done => {
    environment.set('asdf', true);
    expect(environment.asdf).toBe(true);
    expect(environment.get('asdf', false)).toBe(true);
    expect(environment.get('asdf1', false)).toBe(false);
    done();
  });

  it('should expose the argument method properly', done => {
    process.env.SOMETHING = '123';
    expect(environment.argument('something')).toBe('123');
    done();
  });

  it('should obtain package configuration properly', done => {
    const config1 = environment.getConfiguration('testProp', {
      a: 1,
      b: 5,
      c: {
        prop1: true
      },
      production: {
        a: 2,
        c: {
          prop2: true
        }
      }
    });
    expect(config1.a).toBe(2);
    expect(config1.b).toBe(5);
    expect(config1.c.prop1).toEqual(config1.c.prop2);
    done();
  });

});
