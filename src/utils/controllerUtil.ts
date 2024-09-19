// src/utils/controllerUtil.ts

/**
 * Valide les variables d'environnement requises.
 * Lance une erreur si une variable requise est manquante.
 */
async function validateEnvVariables(
  requiredVariables: string[]
): Promise<void> {
  requiredVariables.forEach((variable: string) => {
    if (!process.env[variable]) {
      throw new Error(`Variable d'environnement manquante : ${variable}`)
    }
  })
}

export { validateEnvVariables }
