import express from 'express'
import { ErrorWrapper } from '../../common/utils/utils.wrappers.js'
import JWTMiddleware from '../../common/middelwares/JWTMiddleware.js'
import usersController from './usres.controllers.js'

const router = express.Router()

router.post('/login', ErrorWrapper(usersController.login))
router.get('/me', JWTMiddleware, ErrorWrapper(usersController.getMe))

export default router