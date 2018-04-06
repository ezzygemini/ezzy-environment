const Environment = require('./Environment');
let environment;

describe('Environment', () => {

  beforeEach(() => {
    environment = new Environment();
  });

  it('should have the default ports defined', done => {
    expect(environment.port).toBe(9000);
    expect(environment.httpsPort).toBe(9001);
    done();
  });

  it('should have the necessary properties available', done => {
    expect(environment.development).toBe(false);
    expect(environment.alpha).toBe(false);
    expect(environment.beta).toBe(false);
    expect(environment.gamma).toBe(false);
    expect(environment.production).toBe(false);
    expect(environment.test).toBe(true);
    expect(environment.testing).toBe(true);
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
      testProp: {
        a: 1,
        b: 5,
        c: {
          prop1: true
        },
        d: {
          outside: 1,
          inside: 2
        },
        test: {
          a: 2,
          c: {
            prop2: true
          }
        }
      },
      test: {
        testProp: {
          d: {
            inside: 3
          }
        }
      }
    });
    expect(config1.a).toBe(2);
    expect(config1.b).toBe(5);
    expect(config1.c.prop1).toEqual(config1.c.prop2);
    expect(config1.d.inside).toEqual(3);
    expect(config1.d.outside).toEqual(1);
    done();
  });

  it('should access private configuration options', () => {
    const conf = environment.getConfiguration('sample', {
      _sample: 'abc',
      TEST: {
        _sample: 'def'
      }
    });
    expect(conf).toBe('def');
  });

  it('should access correct configuration option', () => {
    let conf = environment.getConfiguration('sample.b', {
      _sample: {
        b: 'abc'
      },
      TEST: {
        _sample: {
          b: ''
        }
      }
    });
    expect(conf).toBe('');
    conf = environment.getConfiguration('sample.a', {
      _sample: {
        a: ''
      },
      TEST: {
        _sample: {
          a: 'abc'
        }
      }
    });
    expect(conf).toBe('abc');
  });

  it('should be able to access properties in dot notation', () => {
    const conf = {
      _anotherProp: {
        prop1: {
          a: 2
        }
      },
      testProp: {
        prop1: {
          prop2: {
            a: 1
          }
        }
      },
      TEST: {
        _anotherProp: {
          prop2: {
            a: 2
          }
        },
        testProp: {
          prop1: {
            prop3: {
              a: 1
            }
          }
        }
      }
    };
    expect(environment.getConfiguration('testProp.prop1.prop2.a', conf))
      .toBe(1);
    expect(environment.getConfiguration('testProp.prop1.prop2.a', conf))
      .toBe(1);
    expect(environment.getConfiguration('testProp.prop1.prop3.a', conf))
      .toBe(1);
    expect(environment.getConfiguration('anotherProp.prop1.a', conf))
      .toBe(environment.getConfiguration('anotherProp.prop2.a', conf));
  });

  it('should be able to access other environment configuration', () => {
    const conf = {
      testProp: {
        myProps: {
          a: 1
        }
      },
      TEST: {
        testProp: {
          myProps: {
            a: 2
          }
        }
      },
      PRODUCTION: {
        testProp: {
          myProps: {
            a: 3
          }
        }
      }
    };
    expect(environment.getConfiguration('testProp.myProps.a', conf))
      .toBe(2);
    expect(environment
      .getConfiguration('testProp.myProps.a', conf, 'production'))
      .toBe(3);
  });

});
