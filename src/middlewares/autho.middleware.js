import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

const autoMiddleware = asyncHandler(async (req, res, next) => {
  // console.log("Cookies:", req.cookies);
  // console.log("Authorization Header:", req.header("Authorization"));

  const accessToken =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  // console.log("Access Token:", accessToken);

  if (!accessToken) {
    throw new ApiError(401, "Access token missing or invalid");
  }

  let decodeToken;
  try {
    decodeToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired access token");
  }

  const user = await User.findById(decodeToken._id);
  if (!user) {
    throw new ApiError(401, "User not found");
  }

  req.user = user;
  next();
});


export default autoMiddleware;
