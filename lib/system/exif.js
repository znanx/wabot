/*!
 * @znan/wabot v0.2.2-beta.4
 * (c) 2026 znan. All rights reserved.
 * Licensed under Apache-2.0
 *
 * Unauthorized copying, modification, or distribution of this file,
 * via any medium, is strictly prohibited. Proprietary and confidential.
 * Built: 2026-09-20T15:46:51.945Z
 */
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const os_1 = require("os");
const crypto_1 = __importDefault(require("crypto"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const node_webpmux_1 = __importDefault(require("node-webpmux"));
const path_1 = __importDefault(require("path"));
exports.default = new class Exif {
    constructor() {
        this.imageToWebp = async (media) => {
            const tmpFileOut = path_1.default.join((0, os_1.tmpdir)(), `${crypto_1.default.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
            const tmpFileIn = path_1.default.join((0, os_1.tmpdir)(), `${crypto_1.default.randomBytes(6).readUIntLE(0, 6).toString(36)}.jpg`);
            try {
                const buff = Buffer.isBuffer(media) ? media : (typeof media === 'string' && fs_1.default.existsSync(media) ? fs_1.default.readFileSync(media) : Buffer.from(media));
                fs_1.default.writeFileSync(tmpFileIn, buff);
                await new Promise((resolve, reject) => {
                    (0, fluent_ffmpeg_1.default)(tmpFileIn).on("error", reject).on("end", () => resolve(true)).addOutputOptions([
                        "-vcodec",
                        "libwebp",
                        "-vf",
                        "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"
                    ]).toFormat("webp").save(tmpFileOut);
                });
                return fs_1.default.readFileSync(tmpFileOut);
            }
            finally {
                if (fs_1.default.existsSync(tmpFileIn)) {
                    try {
                        fs_1.default.unlinkSync(tmpFileIn);
                    }
                    catch { }
                }
                if (fs_1.default.existsSync(tmpFileOut)) {
                    try {
                        fs_1.default.unlinkSync(tmpFileOut);
                    }
                    catch { }
                }
            }
        };
        this.videoToWebp = async (media, duration = 10) => {
            const tmpFileOut = path_1.default.join((0, os_1.tmpdir)(), `${crypto_1.default.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
            const tmpFileIn = path_1.default.join((0, os_1.tmpdir)(), `${crypto_1.default.randomBytes(6).readUIntLE(0, 6).toString(36)}.mp4`);
            try {
                const buff = Buffer.isBuffer(media) ? media : (typeof media === 'string' && fs_1.default.existsSync(media) ? fs_1.default.readFileSync(media) : Buffer.from(media));
                fs_1.default.writeFileSync(tmpFileIn, buff);
                const maxDuration = duration > 0 && duration <= 10 ? duration : 10;
                await new Promise((resolve, reject) => {
                    (0, fluent_ffmpeg_1.default)(tmpFileIn).on("error", reject).on("end", () => resolve(true)).addOutputOptions([
                        "-vcodec",
                        "libwebp",
                        "-vf",
                        "scale=320:320:force_original_aspect_ratio=decrease,pad=320:320:(ow-iw)/2:(oh-ih)/2:color=white@0.0,fps=15, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
                        "-loop", "0",
                        "-ss", "00:00:00",
                        "-t", String(maxDuration),
                        "-preset", "default",
                        "-an",
                        "-vsync", "0",
                        "-quality", "50"
                    ]).toFormat("webp").save(tmpFileOut);
                });
                return fs_1.default.readFileSync(tmpFileOut);
            }
            finally {
                if (fs_1.default.existsSync(tmpFileIn)) {
                    try {
                        fs_1.default.unlinkSync(tmpFileIn);
                    }
                    catch { }
                }
                if (fs_1.default.existsSync(tmpFileOut)) {
                    try {
                        fs_1.default.unlinkSync(tmpFileOut);
                    }
                    catch { }
                }
            }
        };
        this.writeExifImg = async (media, metadata = {}) => {
            const wMedia = await this.imageToWebp(media);
            const tmpFileIn = path_1.default.join((0, os_1.tmpdir)(), `${crypto_1.default.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
            const tmpFileOut = path_1.default.join((0, os_1.tmpdir)(), `${crypto_1.default.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
            try {
                fs_1.default.writeFileSync(tmpFileIn, wMedia);
                if (metadata && (metadata.packname || metadata.author || metadata.mode)) {
                    const img = new node_webpmux_1.default.Image();
                    const json = {
                        "sticker-pack-id": "moon-bot",
                        "sticker-pack-name": metadata.packname || "",
                        "sticker-pack-publisher": metadata.author || "",
                        "emojis": metadata.emoji ? metadata.emoji : ["🌙🌕🌖🌗🌘🌑🌒🌓🌔"],
                        "web-rest-api": "https://alyachan.dev",
                        ...(metadata && metadata.mode ? {
                            premium: {
                                "accessibility-text": "MOON BOT",
                                "premium": 1
                            },
                            ai: {
                                "accessibility-text": "MOON BOT",
                                "is-ai-sticker": 1
                            },
                            lock: {
                                "accessibility-text": "MOON BOT",
                                "android-app-store-link": "https://whatsapp.com",
                                "ios-app-store-link": "https://whatsapp.com/ios",
                                "is-from-sticker-maker": 0,
                                "is-avatar-sticker": 1,
                                "avatar-sticker-template-id": "whatsapp",
                                "is-avatar-country-sticker": 1,
                                "is-avatar-instant-sticker": 1,
                                "sticker-maker-source-type": 4,
                                "is-avatar-social-sticker": 1,
                                "avatar-sticker-style": "whatsapp",
                                "avatar-sticker-revision-id": "2026",
                                "is-from-user-created-pack": 1,
                                "origin-pack-id": "whatsapp",
                                "is-text-sticker": 1
                            }
                        }[metadata.mode] || {} : {})
                    };
                    const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
                    const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
                    const exif = Buffer.concat([exifAttr, jsonBuff]);
                    exif.writeUIntLE(jsonBuff.length, 14, 4);
                    await img.load(tmpFileIn);
                    img.exif = exif;
                    await img.save(tmpFileOut);
                    return fs_1.default.readFileSync(tmpFileOut);
                }
                return wMedia;
            }
            finally {
                if (fs_1.default.existsSync(tmpFileIn)) {
                    try {
                        fs_1.default.unlinkSync(tmpFileIn);
                    }
                    catch { }
                }
                if (fs_1.default.existsSync(tmpFileOut)) {
                    try {
                        fs_1.default.unlinkSync(tmpFileOut);
                    }
                    catch { }
                }
            }
        };
        this.writeExifWebp = async (media, metadata = {}) => {
            const tmpFileIn = path_1.default.join((0, os_1.tmpdir)(), `${crypto_1.default.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
            const tmpFileOut = path_1.default.join((0, os_1.tmpdir)(), `${crypto_1.default.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
            try {
                const buff = Buffer.isBuffer(media) ? media : (typeof media === 'string' && fs_1.default.existsSync(media) ? fs_1.default.readFileSync(media) : Buffer.from(media));
                fs_1.default.writeFileSync(tmpFileIn, buff);
                if (metadata && (metadata.packname || metadata.author || metadata.mode)) {
                    const img = new node_webpmux_1.default.Image();
                    const json = {
                        "sticker-pack-id": "moon-bot",
                        "sticker-pack-name": metadata.packname || "",
                        "sticker-pack-publisher": metadata.author || "",
                        "emojis": metadata.emoji ? metadata.emoji : ["🌙🌕🌖🌗🌘🌑🌒🌓🌔"],
                        "web-rest-api": "https://alyachan.dev",
                        ...(metadata && metadata.mode ? {
                            premium: {
                                "accessibility-text": "MOON BOT",
                                "premium": 1
                            },
                            ai: {
                                "accessibility-text": "MOON BOT",
                                "is-ai-sticker": 1
                            },
                            lock: {
                                "accessibility-text": "MOON BOT",
                                "android-app-store-link": "https://whatsapp.com",
                                "ios-app-store-link": "https://whatsapp.com/ios",
                                "is-from-sticker-maker": 0,
                                "is-avatar-sticker": 1,
                                "avatar-sticker-template-id": "whatsapp",
                                "is-avatar-country-sticker": 1,
                                "is-avatar-instant-sticker": 1,
                                "sticker-maker-source-type": 4,
                                "is-avatar-social-sticker": 1,
                                "avatar-sticker-style": "whatsapp",
                                "avatar-sticker-revision-id": "2026",
                                "is-from-user-created-pack": 1,
                                "origin-pack-id": "whatsapp",
                                "is-text-sticker": 1
                            }
                        }[metadata.mode] || {} : {})
                    };
                    const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
                    const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
                    const exif = Buffer.concat([exifAttr, jsonBuff]);
                    exif.writeUIntLE(jsonBuff.length, 14, 4);
                    await img.load(tmpFileIn);
                    img.exif = exif;
                    await img.save(tmpFileOut);
                    return fs_1.default.readFileSync(tmpFileOut);
                }
                return buff;
            }
            finally {
                if (fs_1.default.existsSync(tmpFileIn)) {
                    try {
                        fs_1.default.unlinkSync(tmpFileIn);
                    }
                    catch { }
                }
                if (fs_1.default.existsSync(tmpFileOut)) {
                    try {
                        fs_1.default.unlinkSync(tmpFileOut);
                    }
                    catch { }
                }
            }
        };
        this.writeExifVid = async (media, metadata = {}) => {
            const duration = metadata?.duration ? Number(metadata.duration) : 10;
            const wMedia = await this.videoToWebp(media, duration);
            const tmpFileIn = path_1.default.join((0, os_1.tmpdir)(), `${crypto_1.default.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
            const tmpFileOut = path_1.default.join((0, os_1.tmpdir)(), `${crypto_1.default.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
            try {
                fs_1.default.writeFileSync(tmpFileIn, wMedia);
                if (metadata && (metadata.packname || metadata.author || metadata.mode)) {
                    const img = new node_webpmux_1.default.Image();
                    const json = {
                        "sticker-pack-id": "moon-bot",
                        "sticker-pack-name": metadata.packname || "",
                        "sticker-pack-publisher": metadata.author || "",
                        "emojis": metadata.emoji ? metadata.emoji : ["🌙🌕🌖🌗🌘🌑🌒🌓🌔"],
                        "web-rest-api": "https://alyachan.dev",
                        ...(metadata && metadata.mode ? {
                            premium: {
                                "accessibility-text": "MOON BOT",
                                "premium": 1
                            },
                            ai: {
                                "accessibility-text": "MOON BOT",
                                "is-ai-sticker": 1
                            },
                            lock: {
                                "accessibility-text": "MOON BOT",
                                "android-app-store-link": "https://whatsapp.com",
                                "ios-app-store-link": "https://whatsapp.com/ios",
                                "is-from-sticker-maker": 0,
                                "is-avatar-sticker": 1,
                                "avatar-sticker-template-id": "whatsapp",
                                "is-avatar-country-sticker": 1,
                                "is-avatar-instant-sticker": 1,
                                "sticker-maker-source-type": 4,
                                "is-avatar-social-sticker": 1,
                                "avatar-sticker-style": "whatsapp",
                                "avatar-sticker-revision-id": "2026",
                                "is-from-user-created-pack": 1,
                                "origin-pack-id": "whatsapp",
                                "is-text-sticker": 1
                            }
                        }[metadata.mode] || {} : {})
                    };
                    const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
                    const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
                    const exif = Buffer.concat([exifAttr, jsonBuff]);
                    exif.writeUIntLE(jsonBuff.length, 14, 4);
                    await img.load(tmpFileIn);
                    img.exif = exif;
                    await img.save(tmpFileOut);
                    return fs_1.default.readFileSync(tmpFileOut);
                }
                return wMedia;
            }
            finally {
                if (fs_1.default.existsSync(tmpFileIn)) {
                    try {
                        fs_1.default.unlinkSync(tmpFileIn);
                    }
                    catch { }
                }
                if (fs_1.default.existsSync(tmpFileOut)) {
                    try {
                        fs_1.default.unlinkSync(tmpFileOut);
                    }
                    catch { }
                }
            }
        };
    }
};
