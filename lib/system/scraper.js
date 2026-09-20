/*!
 * @znan/wabot v0.2.2-beta.4
 * (c) 2026 znan. All rights reserved.
 * Licensed under Apache-2.0
 *
 * Unauthorized copying, modification, or distribution of this file,
 * via any medium, is strictly prohibited. Proprietary and confidential.
 * Built: 2026-09-20T11:11:56.301Z
 */
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const node_path_1 = __importDefault(require("node:path"));
const promises_1 = __importDefault(require("node:fs/promises"));
const function_1 = __importDefault(require("./function"));
exports.default = new class Scraper {
    constructor() {
        this.getFileBuffer = async (input) => {
            if (Buffer.isBuffer(input))
                return input;
            if (typeof input === 'string') {
                try {
                    if (input.startsWith('http')) {
                        const response = await fetch(input, {
                            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36' }
                        });
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
                        }
                        const arrayBuffer = await response.arrayBuffer();
                        return Buffer.from(arrayBuffer);
                    }
                    else {
                        return await promises_1.default.readFile(input);
                    }
                }
                catch (error) {
                    // Menangkap error network, URL salah, atau file tidak ditemukan
                    throw new Error(`Failed to process input: ${error.message}`);
                }
            }
            throw new Error('Invalid input: must be Buffer, URL string, or filepath string');
        };
        this.shorten = Object.assign((url) => new Promise(async (resolve, reject) => {
            try {
                const res = await fetch(`https://clck.ru/--?url=${encodeURIComponent(url)}`, {
                    headers: {
                        'Accept': '*/*',
                        'Accept-Encoding': 'gzip, deflate, br, zstd',
                        'Accept-Language': 'en-US,en;q=0.5',
                        'Connection': 'keep-alive',
                        'Content-Length': '551',
                        'Cookie': 'bh=EjgiTm90O0E9QnJhbmQiO3Y9IjgiLCAiQ2hyb21pdW0iO3Y9IjE1MCIsICJCcmF2ZSI7dj0iMTUwIioCPzA6CSJXaW5kb3dzImD4o4vTBmoe3Mrh/wiS2KGxA5/P4eoD+/rw5w3r//32D8KuzocI; spravka=dD0xNzg0ODYxMTgxO2k9MTE3LjE4LjIwLjc1O0Q9NUE3MDQzMEREQjc0MUZFMTE3RDI5NkY4REI3NjZERUU1NUI2NTgxNDNBQkYxQTYzQUVEQjg1RDRBOTEzOEQ0MTcwQkZEMDFFRkE4RTM2NDE1MDI3Q0EzMUFBRTczQTI4MkMxN0Q3RTBBNTdEOUIyRDA5NUY4RjZFQ0MzQTZFQTJFQUVBMUYxNTY0QURFMjc1MzRGMDIxNjIzODM4QzYyRjk1MzgyMUVGOUE1QzdEMTA3OTEyO3U9MTc4NDg2MTE4MTQ2NzAwMTc5OTtoPTM4M2VjNzM4NjUzNWRiYTY0MzJiMmJhODViMGNjNjg2; _yasc=3zIIJd0xWA0VY6EStZosvTOacLvSW/9iyGYiF4iwG0IVaVIoLkAti+odXGUIN+f6veTXFlkCgRZY+i0HSQ==',
                        'Host': 'clck.ru',
                        'Origin': 'https://clck.ru',
                        'Referer': 'https://clck.ru/?utm_referrer=https%3A%2F%2Fwww.google.com%2F&url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1DQvkkVXaq%2F&yqrid=af587f50&clckid=723f4508',
                        'Sec-Fetch-Dest': 'empty',
                        'Sec-Fetch-Mode': 'cors',
                        'Sec-Fetch-Site': 'same-origin',
                        'Sec-GPC': '1',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
                        'content-type': 'application/json',
                        'sec-ch-ua': '"Not;A=Brand";v="8", "Chromium";v="150", "Brave";v="150"',
                        'sec-ch-ua-arch': "x86",
                        'sec-ch-ua-bitness': "64",
                        'sec-ch-ua-full-version-list': '"Not;A=Brand";v="8.0.0.0", "Chromium";v="150.0.0.0", "Brave";v="150.0.0.0"',
                        'sec-ch-ua-mobile': '0',
                        'sec-ch-ua-model': "",
                        'sec-ch-ua-platform': "Windows",
                        'sec-ch-ua-platform-version': "19.0.0"
                    },
                });
                if (!res.ok)
                    throw new Error(`clck.ru HTTP ${res.status}`);
                const short = await res.text();
                if (!short.startsWith('http'))
                    throw new Error(`clck.ru response: ${short}`);
                return resolve({
                    status: true,
                    data: {
                        original: url,
                        url: short.trim()
                    }
                });
            }
            catch (e) {
                return resolve({
                    status: false,
                    msg: e instanceof Error ? e.message : String(e)
                });
            }
        }), {
            cleanuri: (url) => new Promise(async (resolve, reject) => {
                try {
                    const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
                    const response = await fetch('https://cleanuri.com/api/v1/shorten', {
                        method: 'POST',
                        headers: {
                            'User-Agent': UA,
                            'Accept': 'application/json',
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: `url=${encodeURIComponent(url)}`,
                    });
                    if (!response.ok)
                        throw new Error(`cleanuri HTTP ${response.status}`);
                    const json = await response.json();
                    if (!json.result_url)
                        throw new Error(`cleanuri: ${JSON.stringify(json)}`);
                    return resolve({
                        status: true,
                        data: {
                            original: url,
                            url: json.result_url
                        }
                    });
                }
                catch (e) {
                    return resolve({
                        status: false,
                        msg: e instanceof Error ? e.message : String(e)
                    });
                }
            }),
            dagd: (url) => new Promise(async (resolve, reject) => {
                try {
                    const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
                    const response = await fetch(`https://da.gd/s?url=${encodeURIComponent(url)}`, {
                        headers: { 'User-Agent': UA, 'Accept': '*/*' },
                    });
                    if (!response.ok)
                        throw new Error(`da.gd HTTP ${response.status}`);
                    const short = await response.text();
                    if (!short.startsWith('http'))
                        throw new Error(`da.gd response: ${short}`);
                    return resolve({
                        status: true,
                        data: {
                            original: url,
                            url: short.trim()
                        }
                    });
                }
                catch (e) {
                    return resolve({
                        status: false,
                        msg: e instanceof Error ? e.message : String(e)
                    });
                }
            }),
            tinyurl: (url) => new Promise(async (resolve, reject) => {
                try {
                    const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
                    const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`, {
                        headers: { 'User-Agent': UA, 'Accept': '*/*' },
                    });
                    if (!response.ok)
                        throw new Error(`tinyurl HTTP ${response.status}`);
                    const short = await response.text();
                    if (!short.startsWith('http'))
                        throw new Error(`tinyurl response: ${short}`);
                    return resolve({
                        status: true,
                        data: {
                            original: url,
                            url: short.trim()
                        }
                    });
                }
                catch (e) {
                    return resolve({
                        status: false,
                        msg: e instanceof Error ? e.message : String(e)
                    });
                }
            }),
            zws: (url) => new Promise(async (resolve, reject) => {
                try {
                    const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
                    const response = await fetch('https://api.zws.im', {
                        method: 'POST',
                        headers: {
                            'User-Agent': UA,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ url }),
                    });
                    if (!response.ok)
                        throw new Error(`zws.im HTTP ${response.status}`);
                    const json = await response.json();
                    if (!json.url)
                        throw new Error(`zws.im: ${JSON.stringify(json)}`);
                    return resolve({
                        status: true,
                        data: {
                            original: url,
                            url: json.url
                        }
                    });
                }
                catch (e) {
                    return resolve({
                        status: false,
                        msg: e instanceof Error ? e.message : String(e)
                    });
                }
            })
        });
        this.uploader = Object.assign((input, time = '24h') => new Promise(async (resolve, reject) => {
            try {
                const expireMap = {
                    '1h': 3600,
                    '6h': 21600,
                    '24h': 86400,
                    '48h': 172800
                };
                const expireSeconds = expireMap[time] ?? expireMap['24h'];
                let file;
                if (Buffer.isBuffer(input)) {
                    file = input;
                }
                else if (typeof input === 'string' && input.startsWith('http')) {
                    file = Buffer.from((await axios_1.default.get(input, {
                        responseType: 'arraybuffer',
                        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36' }
                    })).data);
                }
                else if (typeof input === 'string') {
                    file = promises_1.default.readFile(input);
                }
                else {
                    throw new Error('Invalid input: must be Buffer, URL string, or filepath string');
                }
                const filename = typeof input === 'string' && !input.startsWith('http')
                    ? node_path_1.default.basename(input)
                    : `${function_1.default.uuid()}.tmp`;
                const form = new form_data_1.default();
                form.append('file', file, filename);
                form.append('expire', String(expireSeconds));
                const res = await axios_1.default.post('https://tmpfiles.org/api/v1/upload', form, {
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        ...form.getHeaders()
                    }
                });
                const json = res.data;
                if (json.status !== 'success')
                    throw new Error(`tmpfiles.org: ${json.message}`);
                const rawUrl = json.data.url;
                const idMatch = rawUrl.match(/tmpfiles\.org\/([^/]+)\/(.+)$/);
                if (!idMatch)
                    throw new Error('Gagal parsing id dari tmpfiles.org response');
                const [, id, actualFilename] = idMatch;
                const pageRes = await axios_1.default.get(rawUrl, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36' }
                });
                const html = pageRes.data;
                const urlMatch = html.match(/href="(https:\/\/tmpfiles\.org\/dl\/[^"]+)"/);
                const url = urlMatch ? urlMatch[1] : rawUrl;
                const expiryMatch = html.match(/expires in (\d+)\s*(minute|hour|day)s?/i);
                let expiresInMs = expireSeconds * 1000;
                if (expiryMatch) {
                    const value = parseInt(expiryMatch[1], 10);
                    const unit = expiryMatch[2].toLowerCase();
                    const unitMs = unit === 'minute' ? 60000 : unit === 'hour' ? 3600000 : 86400000;
                    expiresInMs = value * unitMs;
                }
                return resolve({
                    status: true,
                    data: {
                        url,
                        rawUrl,
                        id,
                        filename: actualFilename,
                        size: file.length,
                        provider: 'tmpfiles.org',
                        expiresInMs,
                        expireAt: new Date(Date.now() + expiresInMs).toISOString(),
                    }
                });
            }
            catch (e) {
                return resolve({
                    status: false,
                    msg: e instanceof Error ? e.message : String(e)
                });
            }
        }), {
            litterbox: (input, time = '72h') => new Promise(async (resolve, reject) => {
                try {
                    const file = await this.getFileBuffer(input);
                    const filename = typeof input === 'string' && !input.startsWith('http') && !Buffer.isBuffer(input)
                        ? node_path_1.default.basename(input)
                        : `${function_1.default.uuid()}`;
                    const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
                    const form = new form_data_1.default();
                    form.append('reqtype', 'fileupload');
                    form.append('time', time);
                    form.append('fileToUpload', file, filename);
                    const res = await axios_1.default.post('https://litterbox.catbox.moe/resources/internals/api.php', form, {
                        headers: {
                            'User-Agent': UA,
                            'Accept': '*/*',
                            'Origin': 'https://litterbox.catbox.moe',
                            'Referer': 'https://litterbox.catbox.moe/',
                            ...form.getHeaders()
                        }
                    });
                    const url = res.data;
                    if (!url.startsWith('http'))
                        throw new Error(`litterbox response: ${url}`);
                    const expiryMs = { '1h': 3600, '12h': 43200, '24h': 86400, '72h': 259200 };
                    const expireAt = new Date(Date.now() + (expiryMs[time] ?? 259200) * 1000).toISOString();
                    return resolve({
                        status: true,
                        data: {
                            url: url.trim(),
                            filename: node_path_1.default.basename(url.trim()),
                            size: file.length,
                            provider: 'litterbox.catbox.moe',
                            expiry: time,
                            expireAt,
                        }
                    });
                }
                catch (e) {
                    return resolve({
                        status: false,
                        msg: e instanceof Error ? e.message : String(e)
                    });
                }
            }),
            tempsh: (input) => new Promise(async (resolve, reject) => {
                try {
                    const file = await this.getFileBuffer(input);
                    const filename = typeof input === 'string' && !input.startsWith('http') && !Buffer.isBuffer(input)
                        ? node_path_1.default.basename(input)
                        : `file_${function_1.default.uuid()}`;
                    const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
                    const form = new form_data_1.default();
                    form.append('file', file, filename);
                    const res = await axios_1.default.post('https://temp.sh/upload', form, {
                        headers: {
                            'User-Agent': UA,
                            'Accept': '*/*',
                            'Origin': 'https://temp.sh',
                            'Referer': 'https://temp.sh/',
                            ...form.getHeaders()
                        }
                    });
                    const url = res.data;
                    if (!url.startsWith('http'))
                        throw new Error(`temp.sh response: ${url}`);
                    const trimUrl = url.trim();
                    const expireAt = new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString();
                    return resolve({
                        status: true,
                        data: {
                            url: trimUrl,
                            filename,
                            size: file.length,
                            provider: 'temp.sh',
                            expiry: null,
                            expireAt,
                        }
                    });
                }
                catch (e) {
                    return resolve({
                        status: false,
                        msg: e instanceof Error ? e.message : String(e)
                    });
                }
            }),
            uguu: (input) => new Promise(async (resolve, reject) => {
                try {
                    const file = await this.getFileBuffer(input);
                    const filename = typeof input === 'string' && !input.startsWith('http') && !Buffer.isBuffer(input)
                        ? node_path_1.default.basename(input)
                        : `file_${function_1.default.uuid()}`;
                    const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
                    const form = new form_data_1.default();
                    form.append('files[]', file, filename);
                    const res = await axios_1.default.post('https://uguu.se/upload.php', form, {
                        headers: {
                            'User-Agent': UA,
                            'Accept': 'application/json',
                            'Origin': 'https://uguu.se',
                            'Referer': 'https://uguu.se/',
                            ...form.getHeaders()
                        }
                    });
                    const json = res.data;
                    if (!json.success)
                        throw new Error(`uguu.se: ${JSON.stringify(json.errors)}`);
                    const fileData = json.files[0];
                    return resolve({
                        status: true,
                        data: {
                            url: fileData.url,
                            filename: fileData.filename,
                            mimetype: fileData.mimetype,
                            size: fileData.size,
                            hash: fileData.hash,
                            dupe: fileData.dupe,
                            provider: 'uguu.se',
                            expiry: null,
                        }
                    });
                }
                catch (e) {
                    return resolve({
                        status: false,
                        msg: e instanceof Error ? e.message : String(e)
                    });
                }
            }),
            x0: (input) => new Promise(async (resolve, reject) => {
                try {
                    const file = await this.getFileBuffer(input);
                    const filename = typeof input === 'string' && !input.startsWith('http') && !Buffer.isBuffer(input)
                        ? node_path_1.default.basename(input)
                        : `file_${function_1.default.uuid()}`;
                    const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
                    const form = new form_data_1.default();
                    form.append('file', file, filename);
                    const res = await axios_1.default.post('https://x0.at', form, {
                        headers: {
                            'User-Agent': UA,
                            'Accept': '*/*',
                            'Accept-Language': 'en-US,en;q=0.9',
                            ...form.getHeaders()
                        }
                    });
                    const url = res.data;
                    if (!url.startsWith('http'))
                        throw new Error(`x0.at response: ${url}`);
                    return resolve({
                        status: true,
                        data: {
                            url: url.trim(),
                            filename,
                            size: file.length,
                            provider: 'x0.at',
                            expiry: null,
                            expireAt: null,
                        }
                    });
                }
                catch (e) {
                    return resolve({
                        status: false,
                        msg: e instanceof Error ? e.message : String(e)
                    });
                }
            })
        });
    }
};
