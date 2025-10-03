import express from 'express'
import { ErrorWrapper } from '../../common/utils/utils.wrappers.js'
import JWTMiddleware from '../../common/middelwares/JWTMiddleware.js'
import starsControllers from './stars.controllers.js'

const router = express.Router()

router.post('/proofUsername', ErrorWrapper(starsControllers.proofUsername))

export default router

