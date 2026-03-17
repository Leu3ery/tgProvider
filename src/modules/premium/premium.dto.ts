import Joi from "joi"

export type proofPremiumUsernameDTO = {
    username: string,
    months?: number
}

export const proofPremiumUsernameSchema = Joi.object<proofPremiumUsernameDTO>({
    username: Joi.string().required(),
    months: Joi.number().integer().min(3).max(12).optional()
})

export type previewPremiumDTO = {
    receiverUsername: string,
    months: number
}

export const previewPremiumSchema = Joi.object<previewPremiumDTO>({
    receiverUsername: Joi.string().required(),
    months: Joi.number().integer().valid(3, 6, 12).required()
})

export type buyPremiumDTO = previewPremiumDTO

export const buyPremiumSchema = previewPremiumSchema
