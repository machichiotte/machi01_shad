import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest', // Utilisation de ts-jest pour les fichiers TypeScript
  testEnvironment: "node", // Environnement de test
  testPathIgnorePatterns: ['/node_modules/', '/dist/'], // Ignore le dossier dist
  transform: {
    "^.+\\.ts$": "ts-jest", // Transforme les fichiers .ts en utilisant ts-jest
  },
  modulePaths: ['<rootDir>'], // Définit le chemin racine des modules
  moduleNameMapper: {
    "^@src/(.*)$": "<rootDir>/src/$1", // Alias pour les chemins @src
    "^@config/(.*)$": "<rootDir>/config/$1", // Alias pour @config
    "^@ctrl/(.*)$": "<rootDir>/src/ctrl/$1", // Alias pour @ctrl
    "^@repo/(.*)$": "<rootDir>/src/repo/$1", // Alias pour @repo
    "^@routes/(.*)$": "<rootDir>/src/routes/$1", // Alias pour @routes
    "^@services/(.*)$": "<rootDir>/src/services/$1", // Alias pour @services
    "^@typ/(.*)$": "<rootDir>/src/types/$1", // Alias pour @types
    "^@utils/(.*)$": "<rootDir>/src/utils/$1", // Alias pour @utils
  },
  collectCoverage: true, // Active la collecte de couverture de test
  coverageDirectory: 'coverage', // Dossier où la couverture sera enregistrée
  coverageReporters: ['html', 'text', 'lcov'], // Types de rapports de couverture
};

export default config;