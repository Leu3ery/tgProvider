import { Request, Response, NextFunction } from "express";
import { validationWrapper } from "../../common/utils/utils.wrappers.js";
import { loginDto, loginSchema } from "./users.dto.js";
import { validate } from '@telegram-apps/init-data-node';
import { config } from "../../config/config.js";
import userService from "./users.service.js";

const usersController = {
  async login(req: Request, res: Response) {
    const initData = req.body.initData;

    try {
      validate(initData, config.BOT_SECRET, {expiresIn: 0});
    } catch (e) {   
      return res.status(401).json({ message: "Invalid tg data" });
    }

    const params = new URLSearchParams(initData);
    const userRaw = params.get("user") || "{}";
    const user = JSON.parse(userRaw);

    const dto = validationWrapper<loginDto>(loginSchema, user);

    const token = await userService.login(dto);

    res.status(200).json({ token });
  },

  async getMe(req: Request, res: Response) {
    const userId = res.locals.user.userId;

    const user = await userService.getMe(userId);

    res.status(200).json(user);
  },
};

export default usersController;
