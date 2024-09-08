// src/services/Validations.js
export default class Validations {
  /**
   * @param {string} email
   * @returns {boolean}
   */
  static checkEmail(email) {
    if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)) {
      return true
    }
    return false
  }

  /**
   * @param {string} name
   * @param {number} minLength
   * @returns {boolean}
   */
  static minLength(name, minLength) {
    if (name.length < minLength) {
      return false
    }
    return true
  }
}
