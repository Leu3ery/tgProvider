import { transactionRepository } from "../../server.js";
import { CreateTransactionDTO } from "./transaction.dto.js";
import { Transaction } from "./transaction.model.js";

const transactionsService = {
    async createTransaction(userId: number, dto: CreateTransactionDTO) {
        let transaction = new Transaction();
        transaction.user = { id: userId } as any;
        transaction.senderAddress = dto.senderAddress;
        transaction.sandAt = new Date();
        transaction.amount = dto.amount;
        transaction.status = "pending";
        transaction.type = dto.type;
        await transactionRepository.save(transaction);
    }, 

    async getMyTransactions(userId: number) {
        const transactions = await transactionRepository.find();

        return transactions.map(tx => ({
            id: tx.id,
            sandAt: tx.sandAt,
            senderAddress: tx.senderAddress,
            amount: tx.amount,
            status: tx.status,
            type: tx.type
        }));
    }
}

export default transactionsService;