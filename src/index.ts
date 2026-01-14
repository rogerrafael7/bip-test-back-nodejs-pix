import { app } from './app';
import { config } from './config';
import { logger } from './utils/logger';

app.listen(config.port, () => {
  logger.info(
    {
      event: 'server_start',
      port: config.port,
      docs: `http://localhost:${config.port}/api-docs`,
    },
    `PIX Service running on port ${config.port}`
  );
});
