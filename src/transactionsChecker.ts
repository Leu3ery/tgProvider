import axios from "axios";
import { config } from "./config/config.js";
import { Address } from "ton";
import { transactionRepository, userRepository } from "./server.js";

let lastLt: string | null = null;

async function fetchTransactions() {
  try {
    const url = "https://toncenter.com/api/v3/transactions";
    const params = {
      account: config.TON_ACCOUNT,
      limit: 20,
      offset: 0,
      sort: "desc",
      api_key: config.TONCENTER_API_KEY,
    };

    const headers = {
      accept: "application/json",
      "X-Api-Key": config.TONCENTER_API_KEY,
    };

    const response = await axios.get(url, { params, headers });
    return response.data;
  } catch (error: any) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

function toUserFriendly(addrRaw: string) {
  return Address.parse(addrRaw).toString({
    bounceable: false,
    urlSafe: true,
  });
}

export async function transactionsChecker() {
  setInterval(async () => {
    try {
      const { transactions, address_book } = await fetchTransactions();

      if (!transactions.length) return;

      if (lastLt === null) {
        lastLt = transactions[0].lt;
        console.log("✅ Initialize");
        return;
      }

      const newTransactions = transactions.filter(
        (t: any) => BigInt(t.lt) > BigInt(lastLt!)
      );

      // Process new transactions

      if (newTransactions.length > 0) {
        console.log(`[TRANSACTION] 🔔 Found ${newTransactions.length} new transactions`);
        console.log(`🔔 Found ${newTransactions.length} new transactions:`);

        try {
          for (const t of newTransactions.reverse()) {
            console.log(`[TRANSACTION] Processing transaction:`, {
              lt: t.lt,
              hash: t.hash,
              timestamp: new Date(Number(t.now) * 1000).toISOString()
            });
            if (!t.in_msg.source || !t.in_msg.destination) continue;
            if (t.in_msg.source === t.in_msg.destination) continue;
            const from = t.in_msg?.source
              ? toUserFriendly(t.in_msg.source)
              : "—";
            const to = t.in_msg?.destination
              ? toUserFriendly(t.in_msg.destination)
              : "—";
            const amount = Number(t.in_msg?.value || 0);
            // console.log(t.in_msg.source.toLowerCase())
            // console.log(amount)

            const transFromDB = await transactionRepository.findOne({
              where: {
                status: "pending",
                amount: amount,
                senderAddress: t.in_msg.source.toLowerCase(),
                type: "deposit",
              },
              order: { sandAt: "ASC" },
              relations: ["user"],
            });

            if (transFromDB) {
              const user = await userRepository.findOneBy({
                id: transFromDB.user.id,
              });
              if (user) {
                const oldBalance = Number(user.balance);
                user.balance = oldBalance + Number(amount);
                await userRepository.save(user);

                transFromDB.status = "completed";
                await transactionRepository.save(transFromDB);

                console.log(`[TRANSACTION] Transaction completed:`, {
                  transactionId: transFromDB.id,
                  userId: user.id,
                  username: user.username,
                  amount: amount,
                  oldBalance: oldBalance,
                  newBalance: user.balance,
                  senderAddress: from,
                  receiverAddress: to,
                  type: transFromDB.type,
                  completedAt: new Date().toISOString()
                });
                
                console.log(
                  `   ✔️ Credited ${amount} TON to user ${user.id} (${user.username})`
                );
              } else {
                console.log(
                  `   ❌ User not found for transaction ID ${transFromDB.id}`
                );
              }
            } else {
              console.log(`[TRANSACTION] No matching pending transaction found:`, {
                amount: amount,
                senderAddress: t.in_msg.source.toLowerCase(),
                from: from,
                to: to
              });
            }

            console.log(`💸 ${from} → ${to} : ${amount} TON`);
          }
        } catch (e) {

        }

        lastLt = transactions[0].lt;
      }

      // Cleanup old pending transactions

      const deleteRes = await transactionRepository
        .createQueryBuilder()
        .delete()
        .where("status = :status", { status: "pending" })
        .andWhere(
          `sandAt < NOW() - INTERVAL '${config.TRANSACTIONS_LIFETIME} minutes'`
        )
        .execute();
      if (deleteRes.affected && deleteRes.affected > 0) {
        console.log(
          `🧹 Cleaned up ${deleteRes.affected} old pending transactions`
        );
      }
    } catch (e: any) {
      console.error("❌ Error in checker:", e.message);
    }
  }, 5_000);
}
