import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import festivalRoutes from './routes/festival'
import jeuRoutes from './routes/jeu';
import { errorHandler } from './middleware/errorHandler';
import { env } from './config/env';

const app = express();

// Nécessaire pour que le rate limiter lise la vraie IP client derrière Nginx
app.set('trust proxy', 1);

// Helmet en premier : ses headers s'appliquent à toutes les réponses, y compris CORS preflight
app.use(helmet());

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type'],
  }),
);

// Limite à 16kb pour éviter les attaques DoS par body surdimensionné
app.use(express.json({ limit: '16kb' }));
app.use(cookieParser());

// Rate limiting sur les routes d'authentification (strict : 20 req / 15 min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives, réessayez dans 15 minutes' },
});

// Rate limiting sur les routes de données (modéré : 300 req / 15 min par IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de requêtes, réessayez dans 15 minutes' },
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/festivals', apiLimiter, festivalRoutes)
app.use('/api/jeux', apiLimiter, jeuRoutes);

app.use(errorHandler);

export default app;
