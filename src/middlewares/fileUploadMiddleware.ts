// src/middlewares/fileUploadMiddleware.ts

import { Request, Response, NextFunction } from 'express';

/**
 * Middleware function to handle file uploads
 * 
 * This middleware checks if a file has been uploaded with the request.
 * If a file is present, it sets the file in the request object for further processing.
 * If no file is uploaded, it returns a 400 Bad Request response.
 * In case of any errors, it returns a 500 Internal Server Error response.
 *
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @param {NextFunction} next - The next middleware function
 * @returns {void}
 */
function fileUploadMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    // Check if a file has been uploaded
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded.' });
      return;
    }

    // Set the file in the request object for further processing
    (req as any).uploadedFile = req.file;

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Error in fileUploadMiddleware:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

export { fileUploadMiddleware };
