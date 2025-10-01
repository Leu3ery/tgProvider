import app from './app.js'
import {config} from './config/config.js'
import http from 'http'
import { AppDataSource } from './config/db.js'
import { User } from './modules/users/users.model.js'
import { Repository } from 'typeorm'
import { Transaction } from './modules/transacations/transaction.model.js'

export let userRepository: Repository<User>;
export let transactionRepository: Repository<Transaction>;

const startServer = async () => {
    try {
        await AppDataSource.initialize()

        userRepository = AppDataSource.getRepository(User)
        transactionRepository = AppDataSource.getRepository(Transaction)

        const httpServer = http.createServer(app);
        
        httpServer.listen(config.PORT, () => {
            console.log(`Server runs on http://localhost:${config.PORT}`)
        })
    } catch (error: any) {
        console.log(error.message)
        process.exit(1)
    }
}

startServer()