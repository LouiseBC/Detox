const getPort = require('get-port');
const uuid = require('../utils/uuid');

/**
 *
 * @param {DetoxConfigErrorBuilder} errorBuilder
 * @param {*} detoxConfig
 * @param {*} deviceConfig
 */
async function composeSessionConfig({ errorBuilder, cliConfig, detoxConfig, deviceConfig }) {
  const session = {
    ...detoxConfig.session,
    ...deviceConfig.session,
  };

  if (!session.server && session.sessionId) {
    throw errorBuilder.missingServerProperty();
  }

  if (!session.sessionId && session.server) {
    throw errorBuilder.missingSessionIdProperty();
  }

  if (session.server && session.sessionId && session.autoStart === undefined) {
    session.autoStart = false;
  }

  if (cliConfig.debugSynchronization > 0) {
    session.debugSynchronization = +cliConfig.debugSynchronization;
  }

  return {
    autoStart: true,
    server: `ws://localhost:${await getPort()}`,
    sessionId: uuid.UUID(),
    debugSynchronization: false,

    ...session,
  };
}

module.exports = composeSessionConfig;
