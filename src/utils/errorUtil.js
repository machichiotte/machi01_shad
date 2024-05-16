// src/utils/errorUtil.js
const { AuthenticationError } = require("ccxt");

function handleErrorResponse(res, error, functionName) {
  if (error instanceof AuthenticationError) {
    console.error(`Authentication error in ${functionName}:`, error.message);
    res.status(401).json({
      success: false,
      error: `Authentication error in ${functionName}`,
      message: error.message,
    });
  } else {
    console.error(`Error in ${functionName}:`, error);
    res.status(500).json({ success: false, error });
  }
}

module.exports = {
  handleErrorResponse,
};
