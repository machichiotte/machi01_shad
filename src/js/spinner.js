// src/jspinner.js
import Swal from 'sweetalert2';

/**
 * @returns {void}
 */
const loadingSpin = () => {
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
const successSpin = (title, text, outsideClick, confirmBtn) => {
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
const successSpinHtml = (title, html, outsideClick, confirmBtn) => {
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
const errorSpin = (title, text, outsideClick, confirmBtn) => {
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
const errorSpinHtml = (title, html, outsideClick, confirmBtn) => {
    Swal.fire({
        title: title,
        html: html,
        icon: 'error',
        allowOutsideClick: outsideClick,
        showConfirmButton: confirmBtn
    });
}

export { loadingSpin, successSpin, successSpinHtml, errorSpinHtml, errorSpin };
