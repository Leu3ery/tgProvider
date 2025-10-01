import { ErrorWithStatus } from "../../common/middelwares/errorHandlerMiddleware.js"
import { config } from "../../config/config.js"
import { userRepository } from "../../server.js"
import { loginDto } from "./users.dto.js"
import { User } from "./users.model.js"
import jwt from 'jsonwebtoken'

const userService = {
    async login(dto: loginDto) {
        let user = await userRepository.findOneBy({ id: dto.id })

        if (user) {
            user.username = dto.username
            user.photo = dto.photo_url || ""
            await userRepository.save(user)
        } else {
            user = new User()
            user.id = dto.id
            user.username = dto.username
            user.photo = dto.photo_url || ""
            user.balance = 0
            await userRepository.save(user)
        }

        return jwt.sign({ userId: user.id }, config.JWT_SECRET, { expiresIn: '7d' });
    },

    async getMe(userId: number) {
        const user = await userRepository.findOneBy({ id: userId })

        if (!user) {
            throw new ErrorWithStatus(404, "User not found")
        }

        return {
            id: user.id,
            username: user.username,
            photo: user.photo,
            balance: user.balance
        }
    }
}

export default userService