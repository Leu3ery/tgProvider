import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import path from 'path'
import fs from 'fs'
import { config } from './config/config.js'
import { fileURLToPath } from 'url';

const app = express()

// limiter
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again after 1 minutes"
})

// Public dir
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log(`Created missing directory: ${publicDir}`);
}

app.use('/public', express.static(publicDir))
app.use(limiter)
app.use(cors({
  origin: config.DOMEN
}))
app.use(express.json())



// ROUTES
import usersRouter from './modules/users/users.routes.js'
import paymentRouter from './modules/transacations/transaction.routes.js'
import starRouter from './modules/stars/stars.routes.js'

app.use('/api/users', usersRouter)
app.use('/api/transactions', paymentRouter)
app.use('/api/stars', starRouter)



// Additional handlers
import errorHandler from './common/middelwares/errorHandlerMiddleware.js'
import notFound from './common/middelwares/notFoundMiddleware.js'

app.use(notFound)
app.use(errorHandler)

export default app