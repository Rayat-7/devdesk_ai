
import multer from "multer";
import type { Request, Response, NextFunction } from "express";
import path from "node:path";

const allowedExtensions = [".pdf", ".txt", ".docx"];

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  },

  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      return callback(
        new Error("Only PDF, TXT and DOCX files are allowed")
      );
    }

    callback(null, true);
  }
});

export function uploadDocument(
  req: Request,
  res: Response,
  next: NextFunction
) {
  upload.single("file")(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message:
          error.code === "LIMIT_FILE_SIZE"
            ? "File size cannot exceed 5 MB"
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
