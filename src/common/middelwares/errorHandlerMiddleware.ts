import {Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken';
const { JsonWebTokenError, TokenExpiredError } = jwt;


export class ErrorWithStatus extends Error {
    status?: number

    constructor(status: number, message: string) {
        super(message)
        this.status = status
    }
}

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(err)

    if (err instanceof ErrorWithStatus) {
        const status = err.status || 500
        const message = err.message || "Internal server error"
        res.status(status).json({message});
    } else if (err instanceof TokenExpiredError) {
        res.status(401).json({ message: `Token expired: ${err.message}` });
    } else if (err instanceof JsonWebTokenError) {
        res.status(401).json({ message: `Invalid token: ${err.message}` });
    } else {
        res.status(500).json({message:"Internal server error"});
    }
}

export default errorHandler