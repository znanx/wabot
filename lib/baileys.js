"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baileysHelper = void 0;
const importESM = new Function('specifier', 'return import(specifier)');
let cached = null;
exports.baileysHelper = (async function loadBaileys() {
    if (!cached) {
        cached = importESM('@whiskeysockets/baileys');
    }
    return cached;
})();
