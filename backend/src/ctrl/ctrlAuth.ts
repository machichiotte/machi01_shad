// src/ctrl/ctrlAuth.ts
import { Request, Response } from 'express'
import { ServiceAuth } from '@services/serviceAuth'
import { handleControllerError } from '@utils/errorUtil'

/**
 * Registers a new user. 
 */
async function registerUser(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      res.status(400).json({ message: 'Missing email or password' })
      return
    }

    const status = await ServiceAuth.createUserDBService(req.body)

    if (status) {
      res.status(201).json({ message: 'User created successfully' })
    } else {
      res.status(400).json({ message: 'Error creating user' })
    }
  } catch (error) {
    handleControllerError(res, error, registerUser.name)
  }
}

/**
 * Authenticates a user and generates a session token.
 */
async function loginUser(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      res.status(400).json({ message: 'Missing email or password' })
      return
    }

    const user = await ServiceAuth.findUserByEmail(email)
    if (!user) {
      res.status(401).json({ message: 'Invalid email' })
      return
    }

    const passwordMatch = await ServiceAuth.isPasswordMatch(
      password,
      user.password
    )

    if (passwordMatch) {
      const token = await ServiceAuth.generateSessionToken()
      const data = {
        userId: user['_id'],
        token,
        expiresIn: Date.now() + 2 * 60 * 60 * 1000 // 2 hours in milliseconds
      }
      res.status(200).json({
        message: 'Login successful',
        data
      })
      return
    } else {
      res.status(401).json({ message: 'Invalid password' })
    }
  } catch (error) {
    handleControllerError(res, error, 'loginUser')
  }
}

export { loginUser, registerUser }