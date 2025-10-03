import dotenv from 'dotenv'
dotenv.config()

interface Config {
    PORT: number,
    JWT_SECRET: string,
    POSGRE_HOST: string,
    POSGRE_USERNAME: string,
    POSGRE_PASSWORD: string,
    POSGRE_DB: string,
    DOMEN: string,
    BOT_SECRET: string,
    TON_ACCOUNT: string,
    TONCENTER_API_KEY: string,
    TRANSACTIONS_LIFETIME: number,
    TONNEL_COOKIE: string,
    TONNEL_HASH: string,
}

export const config: Config = {
    PORT: Number(process.env.PORT) || 3000,
    JWT_SECRET: process.env.JWT_SECRET || "secret",
    POSGRE_HOST: process.env.POSGRE_SQL || "localhost",
    POSGRE_USERNAME: process.env.POSGRE_USERNAME || "qwerty",
    POSGRE_PASSWORD: process.env.POSGRE_PASSWORD || "qwerty",
    POSGRE_DB: process.env.POSGRE_DB || "tgProvider",
    DOMEN: process.env.DOMEN || "*",
    BOT_SECRET: process.env.BOT_SECRET || "",
    TON_ACCOUNT: process.env.TON_ACCOUNT || "UQCtOPd3wnPJJXfAMOcy1GUKhEhiQl8kCh3Gq1dIi0UXv2Zw",
    TONCENTER_API_KEY: process.env.TONCENTER_API_KEY || "",
    TRANSACTIONS_LIFETIME: Number(process.env.TRANSACTIONS_LIFETIME) || 5,
    TONNEL_COOKIE: process.env.TONNEL_COOKIE || "",
    TONNEL_HASH: process.env.TONNEL_HASH || "",
}