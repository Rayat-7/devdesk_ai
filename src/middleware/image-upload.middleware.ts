
import multer from "multer";
import type { Request, Response, NextFunction } from "express";
import path from "node:path";

const allowedTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp"
};

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  },

  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const expectedMimeType = allowedTypes[extension];

    if (!expectedMimeType || file.mimetype !== expectedMimeType) {
      return callback(
        new Error("Only JPEG, PNG and WebP images are allowed")
      );
    }

    callback(null, true);
  }
});

export function uploadImage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  upload.single("image")(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message:
          error.code === "LIMIT_FILE_SIZE"
            ? "Image size cannot exceed 5 MB"
            : error.message
      });
    }

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    next();
  });
}
