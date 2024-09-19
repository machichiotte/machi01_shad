module.exports = {
  testEnvironment: "node",
  preset: "ts-jest",
  testPathIgnorePatterns: ['/node_modules/', '/dist/'], // Ignore le dossier dist
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  moduleNameMapper: {
    "^@src/(.*)$": "<rootDir>/src/$1",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@controllers/(.*)$": "<rootDir>/src/controllers/$1",
    "^@routes/(.*)$": "<rootDir>/src/routes/$1",
    "^@models/(.*)$": "<rootDir>/src/models/$1",
    // Ajoutez d'autres alias si nécessaire
  },
};
