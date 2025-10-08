import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs/promises'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export const uploadToCloudinary = async (filePath, filename) => {
  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'musician',
      public_id: filename.split('.')[0], // Remove extension
      resource_type: 'auto', // Handles images, videos, and audio
      overwrite: true
    })
    
    // Delete local file after successful upload
    try {
      await fs.unlink(filePath)
    } catch (err) {
      console.error('Failed to delete local file:', err)
    }
    
    return result.secure_url
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error('Failed to upload file to Cloudinary')
  }
}

export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Cloudinary delete error:', error)
  }
}

export default cloudinary
