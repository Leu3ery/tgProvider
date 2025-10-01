import Joi from "joi"

export type CreateTransactionDTO = {
    senderAddress: string,
    amount: number,
    type: "deposit" | "withdraw"
}

export const CreateTransactionSchema = Joi.object<CreateTransactionDTO>({
    senderAddress: Joi.string().required(),
    amount: Joi.number().required(),
    type: Joi.string().valid("deposit", "withdraw").required()
})