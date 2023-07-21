const Swal = require('sweetalert2');

// Spinners
function loadingSpin() {
    Swal.fire({
        title: 'Traitement en cours',
        text: 'Veuillez patienter...',
        allowOutsideClick: false
    });
}

function successSpin(title, text, outsideClick, confirmBtn) {
    Swal.fire({
        title: title,
        text: text,
        icon: 'success',
        allowOutsideClick: outsideClick,
        showConfirmButton: confirmBtn
    });
}

function successSpinHtml(title, html, outsideClick, confirmBtn) {
    Swal.fire({
        title: title,
        html: html,
        icon: 'success',
        allowOutsideClick: outsideClick,
        showConfirmButton: confirmBtn
    });
}

function errorSpin(title, text, outsideClick, confirmBtn) {
    Swal.fire({
        title: title,
        text: text,
        icon: 'error',
        allowOutsideClick: outsideClick,
        showConfirmButton: confirmBtn
    });
}

module.exports = { loadingSpin, successSpin, successSpinHtml, errorSpin };

