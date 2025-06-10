import {v2 as cloudinary} from "cloudinary"
import fs from "fs" //fs is a file system which helps us to delete , read , edit , open etc (all file function)


  const uploadOnCloudinary = async (localFilePath)=>{
          try {
            if(!localFilePath) return null
          //upload file 
        const response =   cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
          })
          console.log("file has been uploaded successfully",response.url);
          return response;
          } catch (error) {
               fs.unlinkSync(localFilePath)// remove the locally saved temporary file as the upload operation got failed
               return null
          }
  }

  export {uploadOnCloudinary}
  
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_API_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });