// src/middlewares/fileUploadMiddleware.js

// Middleware function to handle file uploads
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
