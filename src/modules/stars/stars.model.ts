import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn, ManyToOne } from "typeorm"
import type { Relation } from "typeorm"
import { User } from "../users/users.model.js"

@Entity()
export class Star {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    sandAt!: Date

    @Column({type: "bigint", default: 0})
    amount!: number

    @Column({type: "bigint", default: 0})
    price!: number

    @Column()
    receiverUsername!: string

    @ManyToOne(() => User, (user) => user.transactions)
    user!: Relation<User>
}