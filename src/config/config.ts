import dotenv from 'dotenv'
dotenv.config()

interface Config {
    PORT: number,
    JWT_SECRET: string,
    POSGRE_SQL: string,
    DOMEN: string
}

export const config: Config = {
    PORT: Number(process.env.PORT) || 3000,
    JWT_SECRET: process.env.JWT_SECRET || "secret",
    POSGRE_SQL: process.env.POSGRE_SQL || "mongodb://127.0.0.1:27017/htlgram",
    DOMEN: process.env.DOMEN || "*"
}