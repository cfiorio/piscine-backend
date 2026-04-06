import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import festivalRoutes from './routes/festival';
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

// Rate limiting sur les routes d'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // fenêtre de 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives, réessayez dans 15 minutes' },
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/festivals', festivalRoutes);

app.use(errorHandler);

export default app;
