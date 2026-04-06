import { z } from 'zod';

export const loginSchema = z.object({
  login: z.string().min(1, 'Login requis'),
  motDePasse: z.string().min(1, 'Mot de passe requis'),
});

export type LoginInput = z.infer<typeof loginSchema>;
