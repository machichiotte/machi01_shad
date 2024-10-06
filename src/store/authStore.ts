// src/store/authStore.ts
import { defineStore } from 'pinia'
import SignupValidations from '../services/SignupValidations'

const serverHost = import.meta.env.VITE_SERVER_HOST
const AUTH = 'auth'
let timer: string = ''

/**
 * @typedef {Object} AuthState
 * @property {string} token
 * @property {string} email
 * @property {string} userId
 * @property {number} expiresIn
 * @property {boolean} autoLogout
 */

/**
 * @typedef {Object} AuthGetters
 * @property {function(AuthState): string} getUserToken
 * @property {function(AuthState): boolean} isUserAuthenticated
 */

/**
 * @typedef {Object} AuthActions
 * @property {function(): void} logout
 * @property {function(): void} autoLogout
 * @property {function(Object): Promise<void>} login
 * @property {function(Object): Promise<Object>} signup
 * @property {function(): void} autoLogin
 * @property {function(Object): Promise<void>} auth
 * @property {function(Object): void} setUserTokenData
 * @property {function(): void} setAutoLogout
 * @property {function(): void} clearUserData
 */

/**
 * @type {import('pinia').StoreDefinition<'auth', AuthState, AuthGetters, AuthActions>}
 */
export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '',
    email: '',
    userId: '',
    expiresIn: 0,
    autoLogout: false
  }),

  getters: {
    /**
     * @param {AuthState} state
     * @returns {string}
     */
    getUserToken(state) {
      return state.token
    },

    /**
     * @param {AuthState} state
     * @returns {boolean}
     */
    isUserAuthenticated(state) {
      return !!state.token
    }
  },

  actions: {
    /**
     */
    logout() {
      this.clearUserData()
      localStorage.removeItem('userData')
      if (timer) {
        clearTimeout(timer)
      }
    },

    /**
     */
    autoLogout() {
      this.logout()
      this.setAutoLogout()
    },

    /**
     * @param {Object} payload
     * @returns {Promise<void>}
     */
    async login(payload: { email: string; password: string }) {
      return this.auth({ ...payload, url: `${serverHost}/${AUTH}/login` })
    },

    /**
     * @param {Object} payload
     * @returns {Promise<Object>}
     */
    async signup(payload: { email: string; password: string }) {
      try {
        const url = `${serverHost}/${AUTH}/register`
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          throw new Error(`Network response was not ok (${response.status})`)
        }

        const data = await response.json()
        return data
      } catch (error) {
        console.error('Error during signup:', error)
        throw error
      }
    },

    /**
     */
    autoLogin() {
      const userDataString = localStorage.getItem('userData')

      if (userDataString) {
        const userData = JSON.parse(userDataString)
        const expirationTime = userData.expiresIn - new Date().getTime()

        if (expirationTime < 10000) {
          this.autoLogout()
        } else {
          timer = setTimeout(() => {
            this.autoLogout()
          }, expirationTime)
        }

        this.setUserTokenData(userData)
      }
    },

    /**
     * @param {Object} payload
     * @returns {Promise<void>}
     */
    async auth(payload: { email: string; password: string; url: string }) {
      const postData = {
        email: payload.email,
        password: payload.password,
        returnSecureToken: true
      }

      try {
        const response = await fetch(payload.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData)
        })

        if (response.status === 200) {
          const data = await response.json()
          const expirationTime = +data.expiresIn

          timer = setTimeout(() => {
            this.autoLogout()
          }, expirationTime)

          const tokenData = {
            email: data.email,
            expiresIn: expirationTime,
            token: data.token,
            userId: data.userId
          }

          localStorage.setItem('userData', JSON.stringify(tokenData))
          this.setUserTokenData(tokenData)
        }
      } catch (error) {
        const errorMessage = SignupValidations.getErrorMessageFromCode(
          error.response.data.error.errors[0].message
        )
        throw errorMessage
      }
    },

    /**
     * @param {Object} payload
     */
    setUserTokenData(payload: { email: string; token: string; expiresIn: number; userId: string }) {
      this.email = payload.email
      this.token = payload.token
      this.expiresIn = payload.expiresIn
      this.userId = payload.userId
      this.autoLogout = false
    },

    /**
     */
    setAutoLogout() {
      this.autoLogout = true
    },

    /**
     */
    clearUserData() {
      this.email = ''
      this.token = ''
      this.expiresIn = 0
      this.userId = ''
    }
  }
})
