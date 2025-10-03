import { Request, Response, NextFunction } from "express";
import { validationWrapper } from "../../common/utils/utils.wrappers.js";
import { proofUsernameDTO, proofUsernameSchema } from "./stars.dto.js";
import { config } from "../../config/config.js";

const starsControllers = {
  async proofUsername(req: Request, res: Response, next: NextFunction) {
    const dto = validationWrapper<proofUsernameDTO>(
      proofUsernameSchema,
      req.body || {}
    );

    const url = "https://fragment.com/api?hash="+config.TONNEL_HASH;

    const headers = {
      accept: "application/json, text/javascript, */*; q=0.01",
      "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,uk;q=0.6",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      cookie: config.TONNEL_COOKIE,
      origin: "https://fragment.com",
      priority: "u=1, i",
      referer: "https://fragment.com/stars/buy",
      "sec-ch-ua":
        '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "x-requested-with": "XMLHttpRequest",
    };

    const body = new URLSearchParams({
      query: dto.username,
      quantity: "",
      method: "searchStarsRecipient",
    });

    fetch(url, {
      method: "POST",
      headers: headers,
      credentials: "include",
      body,
    })
      .then((response) => response.json())
      .then((data) => res.status(200).json({
        recipient: data.found.recipient,
        photo: data.found.photo,
        name: data.found.name
      }))
      .catch((error) => res.status(400).json(error));
  },
};

export default starsControllers;
