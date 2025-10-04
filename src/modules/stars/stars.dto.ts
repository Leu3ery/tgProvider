import Joi from "joi"

export type proofUsernameDTO = {
    username: string
}

export const proofUsernameSchema = Joi.object<proofUsernameDTO>({
    username: Joi.string().required()
})

export type buyStarsDTO = {
    receiverUsername: string,
    amount: number
}

export const buyStarsSchema = Joi.object<buyStarsDTO>({
    receiverUsername: Joi.string().required(),
    amount: Joi.number().min(50).max(1000000).required()
})