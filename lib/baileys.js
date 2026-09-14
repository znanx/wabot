"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baileysHelper = void 0;
/**
 * Single source untuk @whiskeysockets/baileys.
 * Baileys v7 ESM-only — dari CJS wajib dynamic import, dan
 * `new Function(...)` dipakai agar TypeScript tidak mentranspile-nya jadi require().
 * Promise di-cache: modul hanya di-load sekali per proses.
 */
const importESM = new Function('specifier', 'return import(specifier)');
let cached = null;
exports.baileysHelper = (async function loadBaileys() {
    if (!cached) {
        cached = importESM('@whiskeysockets/baileys');
    }
    return cached;
})();
