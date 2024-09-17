// src/controllers/authController.ts
import { Request, Response } from 'express'
import AuthService from '@services/authService'

/**
 * Registers a new user.
 * @param {Request} req - The HTTP request object
 * @param {Response} res - The HTTP response object
 */
async function registerUser(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      console.log('Registration attempt with missing email or password.')
      res
        .status(400)
        .json({ message: 'Missing email or password' })
      return
    }

    const status = await AuthService.createUserDBService(req.body)

    if (status) {
      console.log('User registered successfully', { email })
      res
        .status(201)
        .json({ message: 'User created successfully' })
      return
    }

    console.error('Error creating user', { email })
    res.status(400).json({ message: 'Error creating user' })
  } catch (error) {
    console.error('Registration failed', {
      error: (error as Error).message,
      email: req.body.email
    })
    res.status(500).json({ message: 'Internal server error' })
  }
}

/**
 * Authenticates a user and generates a session token.
 * @param {Request} req - The HTTP request object
 * @param {Response} res - The HTTP response object
 */
async function loginUser(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      console.log('Login attempt with missing email or password.')
      res
        .status(400)
        .json({ status: false, message: 'Missing email or password' })
      return
    }

    const user = await AuthService.findUserByEmail(email)
    if (!user) {
      console.log('Login attempt with invalid email', { email })
      res
        .status(401)
        .json({ status: false, message: 'Invalid email or password' })
      return
    }
    const passwordMatch = await AuthService.isPasswordMatch(
      password,
      user.password
    )

    if (passwordMatch) {
      const token = await AuthService.generateSessionToken()
      console.log('User logged in successfully', { userId: user['_id'], email })
      res.status(200).json({
        status: true,
        message: 'Login successful',
        userId: user['_id'],
        token,
        expiresIn: Date.now() + 2 * 60 * 60 * 1000 // 2 hours in milliseconds
      })
      return
    }

    console.log('Login attempt with invalid password', { email })
    res
      .status(401)
      .json({ status: false, message: 'Invalid email or password' })
  } catch (error) {
    console.error('Login failed', {
      error: (error as Error).message,
      email: req.body.email
    })
    res
      .status(500)
      .json({ status: false, message: 'Login failed due to server error' })
  }
}

export { loginUser, registerUser }
