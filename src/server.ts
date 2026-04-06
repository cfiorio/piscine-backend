import https from 'https';
import http from 'http';
import fs from 'fs';
import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

function start(): void {
  const hasCerts = env.SSL_KEY_PATH && env.SSL_CERT_PATH;

  if (hasCerts) {
    const credentials = {
      key: fs.readFileSync(env.SSL_KEY_PATH as string),
      cert: fs.readFileSync(env.SSL_CERT_PATH as string),
    };
    https.createServer(credentials, app).listen(env.PORT, () => {
      logger.info(`Serveur HTTPS démarré sur le port ${env.PORT}`);
    });
  } else {
    if (env.NODE_ENV === 'production') {
      logger.error('SSL_KEY_PATH et SSL_CERT_PATH sont requis en production');
      process.exit(1);
    }
    http.createServer(app).listen(env.PORT, () => {
      logger.warn(
        `Serveur HTTP démarré sur le port ${env.PORT} — mode développement uniquement`,
      );
    });
  }
}

start();
