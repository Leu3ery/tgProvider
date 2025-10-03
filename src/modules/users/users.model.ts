import { Entity, Column, PrimaryColumn, OneToMany } from "typeorm"
import type { Relation } from "typeorm"
import { Transaction } from "../transacations/transaction.model.js"
import { Star } from "../stars/stars.model.js"

@Entity()
export class User {
    @PrimaryColumn()
    id!: number

    @Column()
    username!: string

    @Column()
    photo!: string


    @Column()
    balance!: number

    @OneToMany(() => Transaction, (transaction) => transaction.user)
    transactions!: Relation<Transaction[]>

    @OneToMany(() => Star, (star) => star.user)
    stars!: Relation<Star[]>
}