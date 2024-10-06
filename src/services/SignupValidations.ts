// src/services/SignupValidations.ts
import Validations from './Validations'

export default class SignupValidations {
  email: string;
  password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  /**
   * @returns {Record<string, string>}
   */
  checkValidations(): Record<string, string> {
    let errors: Record<string, string> = {};

    //email validations
    if (!Validations.checkEmail(this.email)) {
      errors['email'] = 'Invalid Email';
    }

    //password Validations
    if (!Validations.minLength(this.password, 6)) {
      errors['password'] = 'password should be of 6 characters';
    }

    return errors;
  }

  /**
   * @static
   * @param {string} errorCode
   * @returns {string}
   */
  static getErrorMessageFromCode(errorCode: string): string {
    switch (errorCode) {
      case 'EMAIL_EXISTS':
        return 'Email already exists';
      case 'EMAIL_NOT_FOUND':
        return 'Email Not Found';
      case 'INVALID_PASSWORD':
        return 'Invalid Password';
      default:
        return 'Unexpected error occurred. Please try again';
    }
  }
}