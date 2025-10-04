import express from 'express'
import { ErrorWrapper } from '../../common/utils/utils.wrappers.js'
import JWTMiddleware from '../../common/middelwares/JWTMiddleware.js'
import starsControllers from './stars.controllers.js'

const router = express.Router()

router.post('/proofUsername', ErrorWrapper(starsControllers.proofUsername))
router.get('/getTonRate', ErrorWrapper(starsControllers.getTonRate))
router.post('/buyStars', JWTMiddleware, ErrorWrapper(starsControllers.buyStars))
router.get('/getStarsTransactions', JWTMiddleware, ErrorWrapper(starsControllers.getStarsTransactions))

export default router

