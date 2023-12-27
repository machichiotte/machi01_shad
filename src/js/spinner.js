const Swal = require('sweetalert2');

// Spinners
const loadingSpin = () => {
    Swal.fire({
        title: 'Traitement en cours',
        text: 'Veuillez patienter...',
        allowOutsideClick: false
    });
}

const successSpin = (title, text, outsideClick, confirmBtn) => {
    Swal.fire({
        title: title,
        text: text,
        icon: 'success',
        allowOutsideClick: outsideClick,
        showConfirmButton: confirmBtn
    });
}

const successSpinHtml = (title, html, outsideClick, confirmBtn) => {
    Swal.fire({
        title: title,
        html: html,
        icon: 'success',
        allowOutsideClick: outsideClick,
        showConfirmButton: confirmBtn
    });
}

const errorSpin = (title, text, outsideClick, confirmBtn) => {
    Swal.fire({
        title: title,
        text: text,
        icon: 'error',
        allowOutsideClick: outsideClick,
        showConfirmButton: confirmBtn
    });
}

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

