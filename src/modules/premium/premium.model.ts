import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm"
import type { Relation } from "typeorm"
import { User } from "../users/users.model.js"

@Entity()
export class Premium {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    sentAt!: Date

    @Column({ type: "int" })
    months!: number

    @Column({ type: "bigint", default: 0 })
    price!: number

    @Column()
    receiverUsername!: string

    @ManyToOne(() => User, (user) => user.premiums)
    user!: Relation<User>
}
