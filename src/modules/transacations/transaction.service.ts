import { ErrorWithStatus } from "../../common/middelwares/errorHandlerMiddleware.js";
import { transactionRepository, userRepository } from "../../server.js";
import { CreateTransactionDTO } from "./transaction.dto.js";
import { Transaction } from "./transaction.model.js";

const transactionsService = {
    async createTransaction(userId: number, dto: CreateTransactionDTO) {
        const user = await userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new ErrorWithStatus(404, "User not found");
        }

        let transaction = new Transaction();
        transaction.user = user;
        transaction.senderAddress = dto.senderAddress;
        transaction.sandAt = new Date();
        transaction.amount = dto.amount;
        transaction.status = "pending";
        transaction.type = dto.type;
        await transactionRepository.save(transaction);
    }, 

    async getMyTransactions(userId: number) {
        const transactions = await transactionRepository.find({
            where: { user: { id: userId }, status: "completed" },
            order: { sandAt: "DESC" },
            relations: ["user"]
        });

        return transactions.map(tx => ({
            id: tx.id,
            sandAt: tx.sandAt,
            senderAddress: tx.senderAddress,
            amount: tx.amount,
            status: tx.status,
            type: tx.type,
            userId: tx.user.id
        }));
    }
}

export default transactionsService;