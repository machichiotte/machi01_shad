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

// Charger les politiques d'erreurs depuis le fichier JSON
async function loadErrorPolicies() {
  const filePath = path.resolve(__dirname, 'errorPolicies.json');
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

// Détermine si une erreur justifie une nouvelle tentative
function shouldRetry(exchangeId, error, errorPolicies) {
  const exchangePolicies = errorPolicies[exchangeId];
  if (exchangePolicies) {
    const policy = exchangePolicies[error.name];
    if (policy) {
      return policy.retry;
    }
  }
  return true; // Par défaut, retenter si la politique n'est pas définie
}

module.exports = {
  handleErrorResponse,
  loadErrorPolicies,
  shouldRetry
};
