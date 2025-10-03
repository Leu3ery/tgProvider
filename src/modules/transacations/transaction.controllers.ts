import { Request, Response, NextFunction } from "express";
import { validationWrapper } from "../../common/utils/utils.wrappers.js";
import {
  CreateTransactionDTO,
  CreateTransactionSchema,
} from "./transaction.dto.js";
import transactionsService from "./transaction.service.js";

const transactionsController = {
  async createTransaction(req: Request, res: Response) {
    const userId = res.locals.user.userId;
    const dto = validationWrapper<CreateTransactionDTO>(
      CreateTransactionSchema,
      req.body || {}
    );

    await transactionsService.createTransaction(userId, dto);

    res.status(201).end();
  },

  async getMyTransactions(req: Request, res: Response) {
    const userId = res.locals.user.userId;

    const transactions = await transactionsService.getMyTransactions(userId);

    res.status(200).json(transactions);
  }
};

export default transactionsController;
