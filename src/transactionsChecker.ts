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
      limit: 10,
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
      const {transactions, address_book} = await fetchTransactions();

      if (!transactions.length) return;

      if (lastLt === null) {
        lastLt = transactions[0].lt;
        console.log("✅ Initialize");
        return;
      }

      const newTransactions = transactions.filter(
        (t: any) => BigInt(t.lt) > BigInt(lastLt!)
      );

      if (newTransactions.length > 0) {
        console.log(`🔔 Found ${newTransactions.length} new transactions:`);
        for (const t of newTransactions.reverse()) {
          const from = t.in_msg?.source ? toUserFriendly(t.in_msg.source) : "—";
          const to = t.in_msg?.destination
            ? toUserFriendly(t.in_msg.destination)
            : "—";
          const amount = Number(t.in_msg?.value || 0);
          
            const transFromDB = await transactionRepository.findOne({
                where: {
                    status: 'pending',
                    amount: amount,
                    senderAddress: from,
                    type: 'deposit'
                },
                order: { id: "DESC" },
                relations: ["user"]
            })

            if (transFromDB) {
                const user = await userRepository.findOneBy({ id: transFromDB.user.id });
                if (user) {
                    user.balance += amount;
                    await userRepository.save(user);

                    transFromDB.status = 'completed';
                    await transactionRepository.save(transFromDB);

                    console.log(`   ✔️ Credited ${amount} TON to user ${user.id} (${user.username})`);
                } else {
                    console.log(`   ❌ User not found for transaction ID ${transFromDB.id}`);
                }
            }

          console.log(`💸 ${from} → ${to} : ${amount} TON`);
        }

        lastLt = transactions[0].lt;
      }
    } catch (e: any) {
      console.error("❌ Error in checker:", e.message);
    }
  }, 5_000);
}
