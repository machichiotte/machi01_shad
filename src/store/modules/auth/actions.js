// src/store/modules/auth/actions.js
import SignupValidations from '../../../services/SignupValidations'
import {
  AUTH_ACTION,
  LOGIN_ACTION,
  AUTO_LOGIN_ACTION,
  LOGOUT_ACTION,
  SET_USER_TOKEN_DATA_MUTATION,
  SIGNUP_ACTION,
  AUTO_LOGOUT_ACTION,
  SET_AUTO_LOGOUT_MUTATION
} from '../../storeconstants'

const serverHost = import.meta.env.VITE_SERVER_HOST
const AUTH = 'auth'

let timer = ''
export default {
  [LOGOUT_ACTION](context) {
    context.commit(SET_USER_TOKEN_DATA_MUTATION, {
      email: null,
      token: null,
      expiresIn: null,
      token: null,
      userId: null
    })
    localStorage.removeItem('userData')
    if (timer) {
      clearTimeout(timer)
    }
  },

  [AUTO_LOGOUT_ACTION](context) {
    context.dispatch(LOGOUT_ACTION)
    context.commit(SET_AUTO_LOGOUT_MUTATION)
  },

  async [LOGIN_ACTION](context, payload) {
    return context.dispatch(AUTH_ACTION, {
      ...payload,
      url: `${serverHost}/${AUTH}/login`
    })
  },

  async [SIGNUP_ACTION](context, payload) {

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

      const data = await response.json() // Parse the JSON response
      return data
    } catch (error) {
      console.error('Error during signup:', error)
      throw error // Rethrow the error for handling in `onSignup`
    }
  },

  [AUTO_LOGIN_ACTION](context) {
    let userDataString = localStorage.getItem('userData')

    if (userDataString) {
      let userData = JSON.parse(userDataString)
      let expirationTime = userData.expiresIn - new Date().getTime()

      if (expirationTime < 10000) {
        context.dispatch(AUTO_LOGOUT_ACTION)
      } else {
        timer = setTimeout(() => {
          context.dispatch(AUTO_LOGOUT_ACTION)
        }, expirationTime)
      }

      context.commit(SET_USER_TOKEN_DATA_MUTATION, userData)
    }
  },

  async [AUTH_ACTION](context, payload) {
    let postData = {
      email: payload.email,
      password: payload.password,
      returnSecureToken: true
    }
    let response = ''

    try {
      //response = await Axios.post(payload.url, postData);

      response = await fetch(payload.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      })
    } catch (err) {
      // context.commit(LOADING_SPINNER_SHOW_MUTATION, false, {
      //     root: true,
      // });
      let errorMessage = SignupValidations.getErrorMessageFromCode(
        err.response.data.error.errors[0].message
      )
      throw errorMessage
    }

    if (response.status === 200) {
      const data = await response.json()
      let expirationTime = +data.expiresIn

      timer = setTimeout(() => {
        context.dispatch(AUTO_LOGOUT_ACTION)
      }, expirationTime)

      let tokenData = {
        email: data.email,
        expiresIn: expirationTime,
        token: data.token,
        userId: data.userId
      }
      localStorage.setItem('userData', JSON.stringify(tokenData))
      context.commit(SET_USER_TOKEN_DATA_MUTATION, tokenData)
    }
  }
}
