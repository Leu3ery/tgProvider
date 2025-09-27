import { ErrorWithStatus } from '../middelwares/errorHandlerMiddleware.js';
import {ObjectSchema} from 'joi'
import {Request, Response, NextFunction} from 'express'


export function validationWrapper<T>(schema: ObjectSchema<T>, data: any): T {
    const { error, value } = schema.validate(data);
    if (error) {
        throw new ErrorWithStatus(400, error.message)
    } else {
        return value as T
    }
}

export function ErrorWrapper(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
        await fn(req, res, next)
    } catch (error) {
        next(error)
    }
  };
}