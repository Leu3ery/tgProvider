import { Request, Response, NextFunction } from "express";
import { validationWrapper } from "../../common/utils/utils.wrappers.js";
import {
  buyPremiumDTO,
  buyPremiumSchema,
  previewPremiumDTO,
  previewPremiumSchema,
  proofPremiumUsernameDTO,
  proofPremiumUsernameSchema,
} from "./premium.dto.js";
import premiumService from "./premium.services.js";

const premiumControllers = {
  async proofUsername(req: Request, res: Response, next: NextFunction) {
    const dto = validationWrapper<proofPremiumUsernameDTO>(
      proofPremiumUsernameSchema,
      req.body || {}
    );

    const data = await premiumService.proofUsername(dto.username, dto.months);
    res.status(200).json({
      recipient: data.found.recipient,
      photo: data.found.photo,
      name: data.found.name,
    });
  },

  async previewPremium(req: Request, res: Response, next: NextFunction) {
    const dto = validationWrapper<previewPremiumDTO>(
      previewPremiumSchema,
      req.body || {}
    );

    const preview = await premiumService.previewPremium(dto);
    res.status(200).json(preview);
  },

  async buyPremium(req: Request, res: Response, next: NextFunction) {
    const userId = res.locals.user.userId;

    const dto = validationWrapper<buyPremiumDTO>(buyPremiumSchema, req.body || {});

    await premiumService.buyPremium(userId, dto);

    res.status(201).end();
  },

  async getPremiumTransactions(req: Request, res: Response, next: NextFunction) {
    const userId = res.locals.user.userId;

    const premiumTransactions = await premiumService.getPremiumTransactions(userId);

    res.status(200).json(premiumTransactions);
  }
};

export default premiumControllers;
