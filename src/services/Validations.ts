// src/services/Validations.ts
export default class Validations {
  /**
   * @param {string} email
   * @returns {boolean}
   */
  static checkEmail(email: string): boolean {
    return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email);
  }

  /**
   * @param {string} name
   * @param {number} minLength
   * @returns {boolean}
   */
  static minLength(name: string, minLength: number): boolean {
    return name.length >= minLength;
  }
}
