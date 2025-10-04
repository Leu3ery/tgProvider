import { Request, Response, NextFunction } from "express";
import { validationWrapper } from "../../common/utils/utils.wrappers.js";
import { buyStarsDTO, buyStarsSchema, proofUsernameDTO, proofUsernameSchema } from "./stars.dto.js";
import { config } from "../../config/config.js";
import starsService from "./stars.services.js";

const starsControllers = {
  async proofUsername(req: Request, res: Response, next: NextFunction) {
    const dto = validationWrapper<proofUsernameDTO>(
      proofUsernameSchema,
      req.body || {}
    );

    const data = await starsService.proofUsername(dto.username);
    console.log(data)
    res.status(200).json({
        recipient: data.found.recipient,
        photo: data.found.photo,
        name: data.found.name,
    });
  },

  async getTonRate(req: Request, res: Response, next: NextFunction) {
    const data = await starsService.getTonRate();
    res.status(200).json({
        tonRate: data.s.tonRate,
    });
  },

  async buyStars(req: Request, res: Response, next: NextFunction) {
    const userId = res.locals.user.userId;

    const dto = validationWrapper<buyStarsDTO>(buyStarsSchema, req.body || {});
    
    await starsService.buyStars(userId, dto);

    res.status(201).end();
  },

  async getStarsTransactions(req: Request, res: Response, next: NextFunction) {
    const userId = res.locals.user.userId;

    const stars = await starsService.getStarsTransactions(userId);

    res.status(200).json(stars);
  }
};

export default starsControllers;
