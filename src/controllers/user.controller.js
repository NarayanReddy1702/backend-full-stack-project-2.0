import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/apiResponse.js"

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
      message: "User already register",
    });

  //check images
   const avatarLocalPath = await req.files?.avatar[0]?.path
   const coverImageLocalPath = await req.files?.coverImage[0]?.path

   if(!avatarLocalPath){
    throw new ApiError(400,"Avatar field is required")
   }
    
   //upload cloudinary
   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   if(!avatar){
    throw new ApiError(400,"Avatar field is required")
   }

  console.log(avatar);
  

  //create user object 
  
   const user = await User.create({
    username:username.toLowerCase(),
    email,
    password,
    avatar:avatar.url,
    fullname,
    coverImage:coverImage?.url || ""
   })


   const createUser = await User.findById(user._id).select("-password -refrechToken")

   if(!createUser){
      throw new ApiError(500,"Something went Wrong while registaring the user")
   }
   
   return res.status(201).json(
   new ApiResponse(200,createUser,"User registered successfully")
   )
  
});

export default registerUser;
