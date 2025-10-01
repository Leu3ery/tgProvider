import express from 'express'
import { ErrorWrapper } from '../../common/utils/utils.wrappers.js'
import JWTMiddleware from '../../common/middelwares/JWTMiddleware.js'
import transactionsController from './transaction.controllers.js'

const router = express.Router()

router.post('/', JWTMiddleware, ErrorWrapper(transactionsController.createTransaction))
router.get('/', JWTMiddleware, ErrorWrapper(transactionsController.getMyTransactions))

export default router