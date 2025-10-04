import { error } from "console";
import { ErrorWithStatus } from "../../common/middelwares/errorHandlerMiddleware.js";
import { config } from "../../config/config.js";
import { starRepository, userRepository } from "../../server.js";
import { buyStarsDTO } from "./stars.dto.js";
import { mnemonicToPrivateKey, mnemonicToWalletKey } from "@ton/crypto";
import {
  Address,
  Cell,
  TonClient,
  WalletContractV5R1,
  beginCell,
  storeStateInit,
} from "@ton/ton";
import { Star } from "./stars.model.js";

type GetWalletFromMnemonicOpts = {
  mnemonic: string;
  workchain?: 0 | -1;
  bounceable?: boolean; // false -> UQ..., true -> EQ...
};

async function getWalletFromMnemonic(opts: GetWalletFromMnemonicOpts) {
  const { mnemonic, workchain = 0, bounceable = false } = opts;

  const words = mnemonic.trim().split(/\s+/);
  const { publicKey, secretKey } = await mnemonicToPrivateKey(words);

  const wallet = WalletContractV5R1.create({ workchain, publicKey });

  const address = wallet.address.toString({
    urlSafe: true,
    bounceable, // false -> UQ..., true -> EQ...
    testOnly: false,
  });

  const rawAddress = wallet.address.toRawString();

  const cell = beginCell().store(storeStateInit(wallet.init)).endCell();

  const walletStateInit = cell.toBoc().toString("base64");

  const publicKeyHex = Buffer.from(publicKey).toString("hex");

  return {
    address,
    publicKeyHex,
    walletStateInit,
    rawAddress,
  };
}

const commonHeaders = {
  accept: "application/json, text/javascript, */*; q=0.01",
  "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,uk;q=0.6",
  cookie: config.TONNEL_COOKIE,
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
};

export const starsService = {
  async proofUsername(
    username: string
  ): Promise<{ found: { recipient: string; photo: string; name: string } }> {
    const url = "https://fragment.com/api?hash=" + config.TONNEL_HASH;

    const headers = {
      ...commonHeaders,
      origin: "https://fragment.com",
      priority: "u=1, i",
      referer: "https://fragment.com/stars/buy",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "x-requested-with": "XMLHttpRequest",
    };

    const body = new URLSearchParams({
      query: username,
      quantity: "",
      method: "searchStarsRecipient",
    });

    let resp = await fetch(url, {
      method: "POST",
      headers,
      credentials: "include",
      body,
    });

    let data;
    try {
        data = await resp.json();
    } catch (error) {
        throw new ErrorWithStatus(
            400,
            `Fragment error parsing response for username: ${username}`
        );
    }
    if (data.error) {
      throw new ErrorWithStatus(
        400,
        data.error
      );
    }

    return data;
  },

  async getTonRate(): Promise<{ s: { tonRate: number } }> {
    const url = "https://fragment.com/stars";

    const headers = {
      ...commonHeaders,
      priority: "u=1, i",
      referer: "https://fragment.com/premium",
      "x-aj-referer": "https://fragment.com/premium",
      "x-requested-with": "XMLHttpRequest",
    };

    let resp = await fetch(url, {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (!resp.ok) {
      throw new ErrorWithStatus(400, `Fragment error fetching ton rate`);
    }

    return resp.json();
  },

  async initBuyStarsRequest(
    recipient: string,
    quantity: number
  ): Promise<{ req_id: string }> {
    const url = "https://fragment.com/api?hash=" + config.TONNEL_HASH;

    const headers = {
      ...commonHeaders,
      origin: "https://fragment.com",
      priority: "u=1, i",
      referer:
        "https://fragment.com/stars/buy?recipient=3DjbNgL8r4fy2v5NVfoNbic9-KoxM7CkN_LI7Duyubg&quantity=50",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "x-requested-with": "XMLHttpRequest",
    };

    const body = new URLSearchParams({
      recipient: recipient,
      quantity: String(quantity),
      method: "initBuyStarsRequest",
    });

    let resp = await fetch(url, {
      method: "POST",
      headers,
      credentials: "include",
      body,
    });

    if (!resp.ok) {
      throw new ErrorWithStatus(400, `Fragment error initBuyStarsRequest`);
    }
    return resp.json();
  },

  async initProcessPayment(
    req_id: string,
    recipient: string,
    amount: number,
    publicKey: string,
    walletStateInit: string,
    address: string
  ): Promise<{
    transaction: {
      messages: [{
        address: string;
        amount: string;
        payload: string;
      }];
    };
  }> {
    const url = "https://fragment.com/api?hash=" + config.TONNEL_HASH;

    const headers = {
      ...commonHeaders,
      origin: "https://fragment.com",
      priority: "u=1, i",
      referer: `https://fragment.com/stars/buy?recipient=${recipient}&quantity=${amount}`,
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "x-requested-with": "XMLHttpRequest",
    };

    const body = new URLSearchParams({
      account: `{"address":"${address}","chain":"-239","walletStateInit":"${walletStateInit}","publicKey":"${publicKey}"}`,
      device:
        '{"appName":"Tonkeeper","features":["SendTransaction",{"maxMessages":255,"name":"SendTransaction"},{"types":["text","binary","cell"],"name":"SignData"}],"appVersion":"5.4.1","platform":"iphone","maxProtocolVersion":2}',
      transaction: "1",
      id: req_id,
      show_sender: "1",
      method: "getBuyStarsLink",
    });

    const resp = await fetch(url, {
      method: "POST",
      headers,
      credentials: "include",
      body,
    });

    if (!resp.ok) {
      throw new ErrorWithStatus(
        resp.status,
        "Fragment error: cannot get buyStarsLink"
      );
    }

    return resp.json();
  },

  async pay(normalAddress: string, amount: string, payload: string) {
    const client = new TonClient({
      endpoint: "https://toncenter.com/api/v2/jsonRPC",
      apiKey: config.TONCENTER_API_KEY,
    });

    const keyPair = await mnemonicToWalletKey(config.MNEMONIC.split(" "));

    const wallet = WalletContractV5R1.create({
      publicKey: keyPair.publicKey,
      workchain: 0,
    });

    // const state = await client.getContractState(wallet.address);
    // console.log(state);

    const sender = wallet.sender(
      client.provider(wallet.address),
      keyPair.secretKey
    );

    const address = Address.parse(normalAddress);
    const bigIntAmount = BigInt(amount); // in nanotons
    const payloadBoC = payload; // base64
    const bodyCell = Cell.fromBoc(Buffer.from(payloadBoC, "base64"))[0];

    await sender.send({
      to: address,
      value: bigIntAmount,
      body: bodyCell,
      bounce: true,
    });
  },

  async buyStars(userId: number, dto: buyStarsDTO) {
    const usernameData = await this.proofUsername(dto.receiverUsername);
    const recipient = usernameData.found.recipient;

    const tonRateData = await this.getTonRate();
    const tonRate = tonRateData.s.tonRate;

    const userToPay = Math.floor(
      ((dto.amount * 0.015) / tonRate) * config.COMISION_PERCENT * 1_000_000_000
    ); // in nanotons

    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new ErrorWithStatus(404, "User not found");
    }

    if (user.balance < userToPay) {
      throw new ErrorWithStatus(400, "You have not enough balance");
    }

    // console.log(`user.balance before: ${user.balance}`);

    // console.log(
    //   `User ${userId} wants to buy ${dto.amount} stars for ${userToPay} TON to recipient ${recipient}`
    // );

    const initBuyStarsData = await this.initBuyStarsRequest(
      recipient,
      dto.amount
    );

    const req_id = initBuyStarsData.req_id;

    const { address, publicKeyHex, walletStateInit, rawAddress } =
      await getWalletFromMnemonic({
        mnemonic: config.MNEMONIC,
        bounceable: false,
        workchain: 0,
      });

    // console.log(address, publicKeyHex, walletStateInit, rawAddress);

    const processPaymentData = await this.initProcessPayment(
      req_id,
      recipient,
      dto.amount,
      publicKeyHex,
      walletStateInit,
      rawAddress
    );

    // console.log(processPaymentData);
    // console.log(processPaymentData.transaction.messages[0]);

    // console.log(config.TON_ACCOUNT, processPaymentData.transaction.messages[0].amount, processPaymentData.transaction.messages[0].payload);

    await this.pay(
      processPaymentData.transaction.messages[0].address,
      processPaymentData.transaction.messages[0].amount,
      processPaymentData.transaction.messages[0].payload
    );

    user.balance -= userToPay;
    await userRepository.save(user);

    const star = new Star();
    star.user = user;
    star.sandAt = new Date();
    star.price = userToPay;
    star.amount = dto.amount;
    star.receiverUsername = dto.receiverUsername;
    await starRepository.save(star);

    console.log(
      `   ✔️ User ${userId} paid ${userToPay} TON for ${dto.amount} stars to ${recipient}`
    );
  },

  async getStarsTransactions(userId: number) {
    const stars = await starRepository.find({
        where: { user: { id: userId } },
        order: { sandAt: "DESC" },
        relations: ["user"]
    });

    return stars.map(star => ({
        id: star.id,
        sandAt: star.sandAt,
        amount: star.amount,
        price: star.price,
        receiverUsername: star.receiverUsername,
    }));
  }
};

export default starsService;
