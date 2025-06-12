import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
  const user = await User.findById(userId);

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

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
    coverImageLocalPath = req.files.coverImage.path;
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

  console.log(avatar);

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
    "-password -refrechToken"
  );

  if (!createUser) {
    throw new ApiError(500, "Something went Wrong while registaring the user");
  }

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

  const isPasswordValid = await checkUser.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Password is not correct");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    checkUser._id
  );

  const option = {
    secure: true,
    httpOnly: true,
  };

  return res
    .status(200)
    .json(
     new ApiResponse(
        201,
        { checkUser, accessToken, refreshToken },
        "User logged In Successfully"
      )
    )
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option);
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
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
  return res.status(200).clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)
    .json(new ApiResponse(200,{},"User Logged Out"))
});

export { registerUser, loginUser, logoutUser };
