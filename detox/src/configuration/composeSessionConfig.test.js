const DetoxConfigErrorBuilder = require('../errors/DetoxConfigErrorBuilder');

describe('composeSessionConfig', () => {
  let composeSessionConfig;
  let detoxConfig, deviceConfig;
  /** @type {DetoxConfigErrorBuilder} */
  let errorBuilder;

  beforeEach(() => {
    composeSessionConfig = require('./composeSessionConfig');
    errorBuilder = new DetoxConfigErrorBuilder();
    cliConfig = {};
    detoxConfig = {};
    deviceConfig = {};
  });

  const compose = () => composeSessionConfig({
    cliConfig,
    detoxConfig,
    deviceConfig,
    errorBuilder,
  });

  it('should generate a default config', async () => {
    const sessionConfig = await compose();

    expect(sessionConfig).toMatchObject({
      autoStart: true,
      server: expect.stringMatching(/^ws:.*localhost:/),
      sessionId: expect.stringMatching(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i),
    });
  });

  describe('if detoxConfig.session is defined', function() {
    beforeEach(() => {
      detoxConfig.session = {
        server: 'ws://localhost:9999',
        sessionId: 'someSessionId',
      };
    })

    it('should return detoxConfig.session', async () => {
      expect(await compose()).toEqual({
        autoStart: false,
        debugSynchronization: false,
        server: 'ws://localhost:9999',
        sessionId: 'someSessionId',
      });
    });

    test(`providing empty server config should throw`, () => {
      delete detoxConfig.session.server;
      expect(compose()).rejects.toThrowError(errorBuilder.missingServerProperty());
    });

    test(`providing server config with no session should throw`, () => {
      delete detoxConfig.session.sessionId;
      expect(compose()).rejects.toThrowError(errorBuilder.missingSessionIdProperty());
    });

    test(`providing empty config without server and sesionId should not throw`, async () => {
      delete detoxConfig.session.server;
      delete detoxConfig.session.sessionId;

      expect(await compose()).toEqual({
        autoStart: true,
        debugSynchronization: false,
        server: expect.any(String),
        sessionId: expect.any(String),
      });
    });

    describe('if deviceConfig.session is defined', function() {
      beforeEach(() => {
        deviceConfig.session = {
          autoStart: true,
          debugSynchronization: 20000,
          sessionId: 'anotherSession',
        };
      });

      it('should merge deviceConfig.session into detoxConfig.session', async () => {
        expect(await compose()).toEqual({
          autoStart: true,
          debugSynchronization: 20000,
          server: 'ws://localhost:9999',
          sessionId: 'anotherSession',
        });
      });
    });
  });
});

