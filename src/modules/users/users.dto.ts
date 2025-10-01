import Joi from 'joi'

export type loginDto = {
    id: number,
    first_name: string,
    last_name: string,
    username: string,
    language_code: string,
    is_premium: boolean,
    allows_write_to_pm: boolean,
    photo_url: string
}

export const loginSchema = Joi.object<loginDto>({
    id: Joi.number().required(),
    first_name: Joi.string(),
    last_name: Joi.string().allow(null, ''),
    username: Joi.string().required(),
    language_code: Joi.string(),
    is_premium: Joi.boolean(),
    allows_write_to_pm: Joi.boolean(),
    photo_url: Joi.string().allow(null, '')
})