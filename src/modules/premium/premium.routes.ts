import express from 'express'
import { ErrorWrapper } from '../../common/utils/utils.wrappers.js'
import JWTMiddleware from '../../common/middelwares/JWTMiddleware.js'
import premiumControllers from './premium.controllers.js'

const router = express.Router()

router.post('/proofUsername', ErrorWrapper(premiumControllers.proofUsername))
router.post('/preview', ErrorWrapper(premiumControllers.previewPremium))
router.post('/buyPremium', JWTMiddleware, ErrorWrapper(premiumControllers.buyPremium))
router.get('/getPremiumTransactions', JWTMiddleware, ErrorWrapper(premiumControllers.getPremiumTransactions))

export default router
