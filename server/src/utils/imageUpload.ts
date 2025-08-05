import cloudinary from "../lib/cloudinary";
import { logger } from "./logger";

export interface UploadResult {
  public_id: string;
  secure_url: string;
}

/**
 * Upload a single image to Cloudinary
 */
export const uploadImageToCloudinary = async (
  buffer: Buffer,
  folder: string = "hotel-rooms"
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "image",
          folder: folder,
          transformation: [
            { width: 800, height: 600, crop: "fill", quality: "auto" },
          ],
        },
        (error, result) => {
          if (error) {
            logger.error("Cloudinary upload error:", error);
            reject(error);
          } else if (result) {
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
            });
          } else {
            reject(new Error("Upload failed - no result returned"));
          }
        }
      )
      .end(buffer);
  });
};

/**
 * Upload multiple images to Cloudinary
 */
export const uploadMultipleImages = async (
  files: Express.Multer.File[],
  folder: string = "hotel-rooms"
): Promise<UploadResult[]> => {
  const uploadPromises = files.map((file) =>
    uploadImageToCloudinary(file.buffer, folder)
  );

  try {
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    logger.error("Multiple image upload error:", error);
    throw error;
  }
};

/**
 * Delete an image from Cloudinary
 */
export const deleteImageFromCloudinary = async (
  publicId: string
): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
    logger.info(`Image deleted from Cloudinary: ${publicId}`);
  } catch (error) {
    logger.error("Cloudinary delete error:", error);
    throw error;
  }
};
