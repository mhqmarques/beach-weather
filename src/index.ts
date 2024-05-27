import logger from './logger';
import { SetupServer } from './server';
import config from 'config';

export enum ExitedStatus {
  Failure = 1,
  Successes = 0,
}

process.on('unhandledRejection', (promise, reason) => {
  logger.error(
    `App exiting due to an unhandled promise: ${promise} and reason: ${reason}`
  );
  throw reason;
});

process.on('uncaughtException', (error) => {
  logger.error(`App exiting due to an uncaught exception: ${error}`);
  process.exit(ExitedStatus.Failure);
});

(async (): Promise<void> => {
  try {
    const server = new SetupServer(config.get('App.port'));
    await server.initServer();
    server.start();

    const exitSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
    exitSignals.map((sig) => {
      process.on(sig, async () => {
        try {
          await server.close();
          logger.info('App exited with successes');
          process.exit(ExitedStatus.Successes);
        } catch (error) {
          logger.error(`App exited with error: ${error}`);
          process.exitCode = ExitedStatus.Failure;
        }
      });
    });
  } catch (error) {
    logger.error(`App exited with error: ${error}`);
    process.exitCode = ExitedStatus.Failure;
  }
})();
