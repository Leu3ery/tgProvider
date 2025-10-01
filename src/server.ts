import app from './app.js'
import {config} from './config/config.js'
import http from 'http'
import { AppDataSource } from './config/db.js'
import { User } from './modules/users/users.model.js'
import { Repository } from 'typeorm'

export let userRepository: Repository<User>;

const startServer = async () => {
    try {
        await AppDataSource.initialize()

        userRepository = AppDataSource.getRepository(User)

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