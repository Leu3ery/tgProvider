import app from './app.js'
import {config} from './config/config.js'
import http from 'http'


const startServer = async () => {
    try {
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