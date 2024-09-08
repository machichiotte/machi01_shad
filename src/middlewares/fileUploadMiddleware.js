// src/middlewares/fileUploadMiddleware.js

/**
 * Middleware function to handle file uploads
 * 
 * This middleware checks if a file has been uploaded with the request.
 * If a file is present, it sets the file in the request object for further processing.
 * If no file is uploaded, it returns a 400 Bad Request response.
 * In case of any errors, it returns a 500 Internal Server Error response.
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 * @returns {void}
 */
function fileUploadMiddleware(req, res, next) {
  try {
    // Check if a file has been uploaded
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    // Set the file in the request object for further processing
    req.uploadedFile = req.file;

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Error in fileUploadMiddleware:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

module.exports = { fileUploadMiddleware };
