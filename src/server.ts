import http from 'http';
import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

// Le TLS est terminé par Nginx en amont — le backend écoute en HTTP simple
// sur le réseau Docker interne.
http.createServer(app).listen(env.PORT, () => {
  logger.info(`Serveur démarré sur le port ${env.PORT} (${env.NODE_ENV})`);
});
