import { ErrorWithStatus } from "../../common/middelwares/errorHandlerMiddleware.js";
import { config } from "../../config/config.js";
import { premiumRepository, userRepository } from "../../server.js";
import {
  buyPremiumDTO,
  previewPremiumDTO,
} from "./premium.dto.js";
import { mnemonicToPrivateKey, mnemonicToWalletKey } from "@ton/crypto";
import {
  Address,
  Cell,
  TonClient,
  WalletContractV5R1,
  beginCell,
  storeStateInit,
} from "@ton/ton";
import { Premium } from "./premium.model.js";

type GetWalletFromMnemonicOpts = {
  mnemonic: string;
  workchain?: 0 | -1;
  bounceable?: boolean;
};

async function getWalletFromMnemonic(opts: GetWalletFromMnemonicOpts) {
  const { mnemonic, workchain = 0, bounceable = false } = opts;

  const words = mnemonic.trim().split(/\s+/);
  const { publicKey, secretKey } = await mnemonicToPrivateKey(words);

  const wallet = WalletContractV5R1.create({ workchain, publicKey });

  const address = wallet.address.toString({
    urlSafe: true,
    bounceable,
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

const PREMIUM_REFERER = "https://fragment.com/premium/gift";

export const premiumService = {
  async proofUsername(
    username: string,
    months: number = 12
  ): Promise<{ found: { recipient: string; photo: string; name: string; myself?: boolean } }> {
    const url = "https://fragment.com/api?hash=" + config.TONNEL_HASH;

    const headers = {
      ...commonHeaders,
      origin: "https://fragment.com",
      priority: "u=1, i",
      referer: PREMIUM_REFERER,
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "x-requested-with": "XMLHttpRequest",
    };

    const body = new URLSearchParams({
      query: username,
      months: String(months),
      method: "searchPremiumGiftRecipient",
    });

    const resp = await fetch(url, {
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
        `Fragment error parsing premium response for username: ${username}`
      );
    }

    if (!resp.ok || data.error) {
      throw new ErrorWithStatus(400, data.error || "Premium recipient not found");
    }

    return data;
  },

  async initGiftPremiumRequest(
    recipient: string,
    months: number
  ): Promise<{ req_id: string; amount: string; item_title?: string }> {
    const url = "https://fragment.com/api?hash=" + config.TONNEL_HASH;

    const headers = {
      ...commonHeaders,
      origin: "https://fragment.com",
      priority: "u=1, i",
      referer: `${PREMIUM_REFERER}?recipient=${recipient}&months=${months}`,
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "x-requested-with": "XMLHttpRequest",
    };

    const body = new URLSearchParams({
      recipient,
      months: String(months),
      method: "initGiftPremiumRequest",
    });

    const resp = await fetch(url, {
      method: "POST",
      headers,
      credentials: "include",
      body,
    });

    if (!resp.ok) {
      throw new ErrorWithStatus(400, "Fragment error initGiftPremiumRequest");
    }

    const data = await resp.json();

    if (data.error) {
      throw new ErrorWithStatus(400, data.error);
    }

    return data;
  },

  async initProcessPayment(
    req_id: string,
    recipient: string,
    months: number,
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
      referer: `${PREMIUM_REFERER}?recipient=${recipient}&months=${months}`,
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "x-requested-with": "XMLHttpRequest",
    };

    const body = new URLSearchParams({
      account: `{"address":"${address}","chain":"-239","walletStateInit":"${walletStateInit}","publicKey":"${publicKey}"}`,
      device:
        '{"appName":"Tonkeeper","features":["SendTransaction",{"maxMessages":255,"name":"SendTransaction"},{"types":["text","binary","cell"],"name":"SignData"}],"appVersion":"5.4.1","platform":"iphone","maxProtocolVersion":2}',
      transaction: "1",
      id: req_id,
      show_sender: "0",
      method: "getGiftPremiumLink",
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
        "Fragment error: cannot get premium payment link"
      );
    }

    const data = await resp.json();

    if (data.error) {
      throw new ErrorWithStatus(400, data.error);
    }

    return data;
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

    const sender = wallet.sender(
      client.provider(wallet.address),
      keyPair.secretKey
    );

    const address = Address.parse(normalAddress);
    const bigIntAmount = BigInt(amount);
    const bodyCell = Cell.fromBoc(Buffer.from(payload, "base64"))[0];

    await sender.send({
      to: address,
      value: bigIntAmount,
      body: bodyCell,
      bounce: true,
    });
  },

  async previewPremium(dto: previewPremiumDTO) {
    const usernameData = await this.proofUsername(dto.receiverUsername, dto.months);
    const recipient = usernameData.found.recipient;

    const initData = await this.initGiftPremiumRequest(recipient, dto.months);
    const amount = Number(initData.amount);

    if (Number.isNaN(amount)) {
      throw new ErrorWithStatus(400, "Fragment error: invalid premium amount");
    }

    const userToPay = amount * config.COMISION_PERCENT;

    return {
      tonAmount: userToPay,
    };
  },

  async buyPremium(userId: number, dto: buyPremiumDTO) {
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new ErrorWithStatus(404, "User not found");
    }

    const usernameData = await this.proofUsername(dto.receiverUsername, dto.months);
    const recipient = usernameData.found.recipient;

    const initGiftData = await this.initGiftPremiumRequest(recipient, dto.months);

    const { publicKeyHex, walletStateInit, rawAddress } =
      await getWalletFromMnemonic({
        mnemonic: config.MNEMONIC,
        bounceable: false,
        workchain: 0,
      });

    const processPaymentData = await this.initProcessPayment(
      initGiftData.req_id,
      recipient,
      dto.months,
      publicKeyHex,
      walletStateInit,
      rawAddress
    );

    const message = processPaymentData.transaction.messages[0];
    const userToPay = Math.floor(Number(message.amount) * config.COMISION_PERCENT);

    if (user.balance < userToPay) {
      throw new ErrorWithStatus(400, "You have not enough balance");
    }

    await this.pay(
      message.address,
      message.amount,
      message.payload
    );

    user.balance -= userToPay;
    await userRepository.save(user);

    const premium = new Premium();
    premium.user = user;
    premium.sentAt = new Date();
    premium.price = userToPay;
    premium.months = dto.months;
    premium.receiverUsername = dto.receiverUsername;
    await premiumRepository.save(premium);

    console.log(
      `   ✔️ User ${userId} paid ${userToPay} TON for ${dto.months} months premium to ${recipient}`
    );
  },

  async getPremiumTransactions(userId: number) {
    const premiums = await premiumRepository.find({
      where: { user: { id: userId } },
      order: { sentAt: "DESC" },
      relations: ["user"]
    });

    return premiums.map((premium) => ({
      id: premium.id,
      sentAt: premium.sentAt,
      months: premium.months,
      price: premium.price,
      receiverUsername: premium.receiverUsername,
    }));
  }
};

export default premiumService;
