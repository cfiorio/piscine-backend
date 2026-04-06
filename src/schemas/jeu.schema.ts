import { z } from 'zod'

export const jeuCreateSchema = z.object({
  libelleJeu: z.string().max(50).optional().nullable(),
  auteurJeu: z.string().max(250).default(''),
  nbMinJoueurJeu: z.number().int().optional().nullable(),
  nbMaxJoueurJeu: z.number().int().optional().nullable(),
  noticeJeu: z.string().max(4000).optional().nullable(),
  idEditeur: z.number().int().optional().nullable(),
  idTypeJeu: z.number().int().optional().nullable(),
  agemini: z.number().int().default(0),
  prototype: z.boolean().default(false),
  duree: z.number().int().default(0),
  theme: z.string().max(250).default(''),
  description: z.string().max(1000).default(''),
  imageJeu: z.string().max(150).default(''),
  videoRegle: z.string().max(150).default(''),
})

export const jeuUpdateSchema = jeuCreateSchema.partial()

export type JeuCreateInput = z.infer<typeof jeuCreateSchema>
export type JeuUpdateInput = z.infer<typeof jeuUpdateSchema>
