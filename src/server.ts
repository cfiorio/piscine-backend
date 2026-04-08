import https from 'https';
import http from 'http';
import fs from 'fs';
import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

// En production, le TLS est terminé par Nginx — HTTP simple sur le réseau Docker interne.
// En développement, HTTPS avec cert auto-signé si les chemins sont fournis.
if (env.SSL_KEY_PATH && env.SSL_CERT_PATH) {
  const credentials = {
    key: fs.readFileSync(env.SSL_KEY_PATH),
    cert: fs.readFileSync(env.SSL_CERT_PATH),
  };
  https.createServer(credentials, app).listen(env.PORT, () => {
    logger.info(`Serveur HTTPS démarré sur le port ${env.PORT} (${env.NODE_ENV})`);
  });
} else {
  http.createServer(app).listen(env.PORT, () => {
    logger.info(`Serveur HTTP démarré sur le port ${env.PORT} (${env.NODE_ENV})`);
  });
}
