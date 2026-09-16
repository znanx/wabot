/*!
 * @znan/wabot v0.2.2-beta.4
 * (c) 2026 znan. All rights reserved.
 * Licensed under Apache-2.0
 *
 * Unauthorized copying, modification, or distribution of this file,
 * via any medium, is strictly prohibited. Proprietary and confidential.
 * Built: 2026-09-16T10:19:46.141Z
 */
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
