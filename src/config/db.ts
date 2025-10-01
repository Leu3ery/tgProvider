import { DataSource } from "typeorm";
import { config } from "./config.js";
import { User } from "../modules/users/users.model.js";
import { Transaction } from "../modules/transacations/transaction.model.js";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: config.POSGRE_HOST,
    port: 5432,
    username: config.POSGRE_USERNAME,
    password: config.POSGRE_PASSWORD,
    database: config.POSGRE_DB,
    synchronize: true,
    logging: true,
    entities: [User, Transaction],
    subscribers: [],
    migrations: [],
})
