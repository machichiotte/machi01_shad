// src/spinner.ts
import Swal from 'sweetalert2';

/**
 * @returns {void}
 */
const loadingSpin = (): void => {
    Swal.fire({
        title: 'Processing',
        text: 'Please wait...',
        allowOutsideClick: false
    });
}

/**
 * @param {string} title
 * @param {string} text
 * @param {boolean} outsideClick
 * @param {boolean} confirmBtn
 * @returns {void}
 */
const successSpin = (title: string, text: string, outsideClick: boolean, confirmBtn: boolean): void => {
    Swal.fire({
        title: title,
        text: text,
        icon: 'success',
        allowOutsideClick: outsideClick,
        showConfirmButton: confirmBtn
    });
}

/**
 * @param {string} title
 * @param {string} html
 * @param {boolean} outsideClick
 * @param {boolean} confirmBtn
 * @returns {void}
 */
const successSpinHtml = (title: string, html: string, outsideClick: boolean, confirmBtn: boolean): void => {
    Swal.fire({
        title: title,
        html: html,
        icon: 'success',
        allowOutsideClick: outsideClick,
        showConfirmButton: confirmBtn
    });
}

/**
 * @param {string} title
 * @param {string} text
 * @param {boolean} outsideClick
 * @param {boolean} confirmBtn
 * @returns {void}
 */
const errorSpin = (title: string, text: string, outsideClick: boolean, confirmBtn: boolean): void => {
    Swal.fire({
        title: title,
        text: text,
        icon: 'error',
        allowOutsideClick: outsideClick,
        showConfirmButton: confirmBtn
    });
}

/**
 * @param {string} title
 * @param {string} html
 * @param {boolean} outsideClick
 * @param {boolean} confirmBtn
 * @returns {void}
 */
const errorSpinHtml = (title: string, html: string, outsideClick: boolean, confirmBtn: boolean): void => {
    Swal.fire({
        title: title,
        html: html,
        icon: 'error',
        allowOutsideClick: outsideClick,
        showConfirmButton: confirmBtn
    });
}

export { loadingSpin, successSpin, successSpinHtml, errorSpinHtml, errorSpin };
