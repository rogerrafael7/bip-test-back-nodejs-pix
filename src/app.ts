import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { pixRouter } from './routes/pix';
import { errorHandler } from './middleware/errorHandler';
import { swaggerSpec } from './swagger';
import { logger } from './utils/logger';

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      event: 'http_request',
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
    });
  });
  next();
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/pix', pixRouter);

app.use(errorHandler);

export { app };
