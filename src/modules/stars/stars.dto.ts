import Joi from "joi"

export type proofUsernameDTO = {
    username: string
}

export const proofUsernameSchema = Joi.object<proofUsernameDTO>({
    username: Joi.string().required()
})