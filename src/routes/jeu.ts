import { Router } from 'express'
import { authenticate } from '../middleware/authenticate'
import { authorizeAdmin } from '../middleware/authorizeAdmin'
import * as jeuController from '../controllers/jeuController'

const router = Router()

// Toutes les routes nécessitent une authentification admin
router.get('/', authenticate, authorizeAdmin, jeuController.getAll)
router.get('/mecanismes', authenticate, authorizeAdmin, jeuController.getAllWithMecanismes)
router.get('/festival/latest', authenticate, authorizeAdmin, jeuController.getAllByLatestFestivalWithDetails)
router.get('/:id', authenticate, authorizeAdmin, jeuController.getById)
router.get('/:id/mecanismes', jeuController.getByIdWithMecanismes)
router.post('/', authenticate, authorizeAdmin, jeuController.create)
router.put('/:id', authenticate, authorizeAdmin, jeuController.update)
router.delete('/:id', authenticate, authorizeAdmin, jeuController.remove)

export default router
