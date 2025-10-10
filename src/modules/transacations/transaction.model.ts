import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn, ManyToOne } from "typeorm"
import type { Relation } from "typeorm"
import { User } from "../users/users.model.js"

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    sandAt!: Date

    @Column()
    senderAddress!: string

    @Column({type: "bigint", default: 0})
    amount!: number

    @Column()
    status!: "pending" | "completed"

    @Column()
    type!: "deposit" | "withdraw"

    @ManyToOne(() => User, (user) => user.transactions)
    user!: Relation<User>
}