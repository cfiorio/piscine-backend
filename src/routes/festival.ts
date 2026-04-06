import { Router } from 'express'
import { authenticate } from '../middleware/authenticate'
import { authorizeAdmin } from '../middleware/authorizeAdmin'
import * as festivalController from '../controllers/festivalController'

const router = Router()

// Route publique — dernier festival en date
router.get('/latest', festivalController.getLatest)

// Routes admin uniquement
router.get('/', authenticate, authorizeAdmin, festivalController.getAll)
router.get('/:id', authenticate, authorizeAdmin, festivalController.getById)
router.post('/', authenticate, authorizeAdmin, festivalController.create)
router.put('/:id', authenticate, authorizeAdmin, festivalController.update)
router.delete('/:id', authenticate, authorizeAdmin, festivalController.remove)

export default router
