import { z } from 'zod'

export const festivalCreateSchema = z.object({
  anneeFestival: z.string().optional().nullable(),
  nbEmplacementTotal: z.number().optional().nullable(),
  nbEmplPremium: z.number().int().default(0),
  nbEmplStandard: z.number().int().default(0),
  nbEmplPromo: z.number().int().default(0),
  prixEmplacementFestival: z.number().optional().nullable(),
  prixEmplacementPremium: z.number().default(100),
  prixEmplacementPromo: z.number().default(95),
  m2EmplacementStandard: z.number().optional().nullable(),
  m2EmplacementPremium: z.number().optional().nullable(),
  m2EmplacementPromo: z.number().optional().nullable(),
  nomEmplPremium: z.string().max(50).default('Premium'),
  nomEmplStandard: z.string().max(50).default('Standard'),
  nomEmplPromo: z.string().max(50).default('Promo'),
})

export const festivalUpdateSchema = festivalCreateSchema.partial()

export type FestivalCreateInput = z.infer<typeof festivalCreateSchema>
export type FestivalUpdateInput = z.infer<typeof festivalUpdateSchema>
