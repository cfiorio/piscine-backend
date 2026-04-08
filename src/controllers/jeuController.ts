import type { Request, Response, NextFunction } from 'express'
import { jeuCreateSchema, jeuUpdateSchema } from '../schemas/jeu.schema'
import * as jeuService from '../services/jeuService'

export async function getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const jeux = await jeuService.getAll()
    res.status(200).json(jeux)
  } catch (err) {
    next(err)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ error: 'Identifiant invalide' })
      return
    }
    const jeu = await jeuService.getById(id)
    res.status(200).json(jeu)
  } catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = jeuCreateSchema.parse(req.body)
    const jeu = await jeuService.create(data)
    res.status(201).json(jeu)
  } catch (err) {
    next(err)
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ error: 'Identifiant invalide' })
      return
    }
    const data = jeuUpdateSchema.parse(req.body)
    const jeu = await jeuService.update(id, data)
    res.status(200).json(jeu)
  } catch (err) {
    next(err)
  }
}

export async function getAllByFestivalWithDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const festivalId = parseInt(req.params.festivalId, 10)
    if (isNaN(festivalId)) { res.status(400).json({ error: 'Identifiant de festival invalide' }); return }
    const jeux = await jeuService.getAllByFestivalWithDetails(festivalId)
    res.status(200).json(jeux)
  } catch (err) {
    next(err)
  }
}

export async function getAllByLatestFestivalWithDetails(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const jeux = await jeuService.getAllByLatestFestivalWithDetails()
    res.status(200).json(jeux)
  } catch (err) {
    next(err)
  }
}

export async function getEditeursByFestival(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const festivalId = parseInt(req.params.festivalId, 10)
    if (isNaN(festivalId)) { res.status(400).json({ error: 'Identifiant de festival invalide' }); return }
    const editeurs = await jeuService.getEditeursByFestival(festivalId)
    res.status(200).json(editeurs)
  } catch (err) {
    next(err)
  }
}

export async function getEditeursByLatestFestival(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const editeurs = await jeuService.getEditeursByLatestFestival()
    res.status(200).json(editeurs)
  } catch (err) {
    next(err)
  }
}

export async function getAllWithMecanismes(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const jeux = await jeuService.getAllWithMecanismes()
    res.status(200).json(jeux)
  } catch (err) {
    next(err)
  }
}

export async function getByIdWithMecanismes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ error: 'Identifiant invalide' })
      return
    }
    const jeu = await jeuService.getByIdWithMecanismes(id)
    res.status(200).json(jeu)
  } catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ error: 'Identifiant invalide' })
      return
    }
    await jeuService.remove(id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
