import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  const user = await User.findById(userId);

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  // console.log("ref", refreshToken);

  user.refreshToken = refreshToken;
  user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, fullname } = req.body;
  if (
    [fullname, email, password, username].some((field) => {
      field?.trim() === "";
    })
  ) {
    throw new ApiError(400, `${field} is required`);
  }
  const existUser = await User.findOne({
    $or: [{ email }, { password }],
  });
  if (existUser)
    return res.status(409).json({
      message: "User already registered",
    });

  //check images
  const avatarLocalPath = await req.files?.avatar[0]?.path;
  //const coverImageLocalPath = await req.files?.coverImage[0]?.path

  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar field is required");
  }

  //upload cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar field is required");
  }

  // console.log(avatar);

  //create user object

  const user = await User.create({
    username: username.toLowerCase(),
    email,
    password,
    avatar: avatar.url,
    fullname,
    coverImage: coverImage?.url || "",
  });

  const createUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createUser) {
    throw new ApiError(500, "Something went Wrong while registaring the user");
  }

  const { accessToken, refreshToken } = generateAccessAndRefreshToken(
    createUser._id
  );

  return res
    .status(201)
    .json(new ApiResponse(200, createUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password, username } = req.body;

  if (!(email || username)) {
    throw new ApiError(400, " email or username is required");
  }

  const checkUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!checkUser) {
    throw new ApiError(404, "User doesn't exist");
  }

  const isPasswordValid = await checkUser.isPasswordCorrect(password.trim());

  if (!isPasswordValid) {
    throw new ApiError(401, "Password is not correct");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    checkUser._id
  );

  // console.log("access token", accessToken);
  // console.log("Refresh Tokwn", refreshToken);

  const option = {
    secure: true,
    httpOnly: true,
  };

  res
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .status(200)
    .json(
      new ApiResponse(
        201,
        { checkUser, accessToken, refreshToken },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  console.log(req.user);

  const userData = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const option = {
    secure: true,
    httpOnly: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new ApiResponse(200, {}, "User Logged Out"));
});

const refreshToken = asyncHandler(async (req, res) => {
  const incomeingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomeingRefreshToken) {
    throw new ApiError(401, "unauthorized User");
  }

  try {
    const decodeRefreshToken = jwt.verify(
      incomeingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodeRefreshToken?._id);

    if (!user) {
      throw new ApiError(401, "Refresh token is Expired or used");
    }

    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const option = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .cookie("AccessToken", accessToken, option)
      .cookie("RefreshToken", refreshToken, option)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken, user },
          "Access Token Refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(400, error?.message);
  }
});

export { registerUser, loginUser, logoutUser, refreshToken };
