import { Router } from "express";
import {loginUser, logoutUser, refreshToken, registerUser} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import autoMiddleware from "../middlewares/autho.middleware.js";

const router = Router();
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser)
router.route("/logout").post(autoMiddleware , logoutUser)
router.route("/refresh-token").post(refreshToken)

export default router;
