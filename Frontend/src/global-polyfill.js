// global-polyfill.js
if (typeof global === 'undefined') {
    window.global = window;
}