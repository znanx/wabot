/*!
 * @znan/wabot v0.2.2-beta.4
 * (c) 2026 znan. All rights reserved.
 * Licensed under Apache-2.0
 *
 * Unauthorized copying, modification, or distribution of this file,
 * via any medium, is strictly prohibited. Proprietary and confidential.
 * Built: 2026-09-20T09:03:28.007Z
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
            let tmpFileOut = path_1.default.join((0, os_1.tmpdir)(), `${crypto_1.default.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
            let tmpFileIn = path_1.default.join((0, os_1.tmpdir)(), `${crypto_1.default.randomBytes(6).readUIntLE(0, 6).toString(36)}.jpg`);
            fs_1.default.writeFileSync(tmpFileIn, media);
            await new Promise((resolve, reject) => {
                (0, fluent_ffmpeg_1.default)(tmpFileIn).on("error", reject).on("end", () => resolve(true)).addOutputOptions([
                    "-vcodec",
                    "libwebp",
                    "-vf",
                    "scale=320:320:force_original_aspect_ratio=decrease,pad=320:320:(ow-iw)/2:(oh-ih)/2:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"
                ]).toFormat("webp").save(tmpFileOut);
            });
            let buff = fs_1.default.readFileSync(tmpFileOut);
            fs_1.default.unlinkSync(tmpFileOut);
            fs_1.default.unlinkSync(tmpFileIn);
            return buff;
        };
        this.videoToWebp = async (media) => {
            let tmpFileOut = path_1.default.join((0, os_1.tmpdir)(), `${crypto_1.default.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
            let tmpFileIn = path_1.default.join((0, os_1.tmpdir)(), `${crypto_1.default.randomBytes(6).readUIntLE(0, 6).toString(36)}.mp4`);
            fs_1.default.writeFileSync(tmpFileIn, media);
            await new Promise((resolve, reject) => {
                (0, fluent_ffmpeg_1.default)(tmpFileIn).on("error", reject).on("end", () => resolve(true)).addOutputOptions([
                    "-vcodec",
                    "libwebp",
                    "-vf",
                    "scale=320:320:force_original_aspect_ratio=decrease,pad=320:320:(ow-iw)/2:(oh-ih)/2:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
                    "-loop", "0", "-ss", "00:00:00", "-t", "00:00:05",
                    "-preset",
                    "default",
                    "-an",
                    "-vsync",
                    "0"
                ]).toFormat("webp").save(tmpFileOut);
            });
            let buff = fs_1.default.readFileSync(tmpFileOut);
            fs_1.default.unlinkSync(tmpFileOut);
            fs_1.default.unlinkSync(tmpFileIn);
            return buff;
        };
        this.writeExifImg = async (media, metadata) => {
            let wMedia = await this.imageToWebp(media);
            let tmpFileIn = path_1.default.join((0, os_1.tmpdir)(), `${crypto_1.default.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
            let tmpFileOut = path_1.default.join((0, os_1.tmpdir)(), `${crypto_1.default.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
            fs_1.default.writeFileSync(tmpFileIn, wMedia);
            if (metadata.packname || metadata.author) {
                let img = new node_webpmux_1.default.Image();
                let json = {
                    "sticker-pack-id": "moon-bot",
                    "sticker-pack-name": metadata.packname,
                    "sticker-pack-publisher": metadata.author,
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
                let exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
                let jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
                let exif = Buffer.concat([exifAttr, jsonBuff]);
                exif.writeUIntLE(jsonBuff.length, 14, 4);
                await img.load(tmpFileIn);
                fs_1.default.unlinkSync(tmpFileIn);
                img.exif = exif;
                await img.save(tmpFileOut);
                return tmpFileOut;
            }
        };
        this.writeExifWebp = async (media, metadata) => {
            let tmpFileIn = path_1.default.join((0, os_1.tmpdir)(), `${crypto_1.default.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
            let tmpFileOut = path_1.default.join((0, os_1.tmpdir)(), `${crypto_1.default.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
            fs_1.default.writeFileSync(tmpFileIn, media);
            if (metadata.packname || metadata.author) {
                let img = new node_webpmux_1.default.Image();
                let json = {
                    "sticker-pack-id": "moon-bot",
                    "sticker-pack-name": metadata.packname,
                    "sticker-pack-publisher": metadata.author,
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
                let exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
                let jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
                let exif = Buffer.concat([exifAttr, jsonBuff]);
                exif.writeUIntLE(jsonBuff.length, 14, 4);
                await img.load(tmpFileIn);
                fs_1.default.unlinkSync(tmpFileIn);
                img.exif = exif;
                await img.save(tmpFileOut);
                return tmpFileOut;
            }
        };
        this.writeExifVid = async (media, metadata) => {
            let wMedia = await this.videoToWebp(media);
            let tmpFileIn = path_1.default.join((0, os_1.tmpdir)(), `${crypto_1.default.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
            let tmpFileOut = path_1.default.join((0, os_1.tmpdir)(), `${crypto_1.default.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
            fs_1.default.writeFileSync(tmpFileIn, wMedia);
            if (metadata.packname || metadata.author) {
                let img = new node_webpmux_1.default.Image();
                let json = {
                    "sticker-pack-id": "moon-bot",
                    "sticker-pack-name": metadata.packname,
                    "sticker-pack-publisher": metadata.author,
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
                let exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
                let jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
                let exif = Buffer.concat([exifAttr, jsonBuff]);
                exif.writeUIntLE(jsonBuff.length, 14, 4);
                await img.load(tmpFileIn);
                fs_1.default.unlinkSync(tmpFileIn);
                img.exif = exif;
                await img.save(tmpFileOut);
                return tmpFileOut;
            }
        };
    }
};
