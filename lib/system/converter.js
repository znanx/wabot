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
const child_process_1 = require("child_process");
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const sharp_1 = __importDefault(require("sharp"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const function_1 = __importDefault(require("./function"));
exports.default = new class Converter {
    constructor() {
        /**
         *
         * @param {*} buffer
         * @param {*} args
         * @param {*} ext
         * @param {*} ext2
         * @returns
         */
        this.ffmpeg = (buffer, args = [], ext = '', ext2 = '') => {
            return new Promise(async (resolve, reject) => {
                try {
                    let tmp = 'tmp/' + function_1.default.uuid() + '.' + ext;
                    let out = tmp + '.' + ext2;
                    await node_fs_1.default.promises.writeFile(tmp, buffer);
                    (0, child_process_1.spawn)('ffmpeg', ['-y', '-i', tmp, ...args, out]).on('error', reject).on('close', async (code) => {
                        try {
                            await node_fs_1.default.promises.unlink(tmp);
                            if (code !== 0)
                                return reject(code);
                            resolve(await node_fs_1.default.promises.readFile(out));
                            await node_fs_1.default.promises.unlink(out);
                        }
                        catch (e) {
                            reject(e);
                        }
                    });
                }
                catch (e) {
                    reject(e);
                }
            });
        };
        /**
         * Convert Audio to Playable WhatsApp Audio
         * @param {Buffer} buffer Audio Buffer
         * @param {String} ext File Extension
         */
        this.toAudio = (buffer, ext) => {
            return this.ffmpeg(buffer, ['-vn', '-ac', '2', '-b:a', '128k', '-ar', '44100', '-f', 'mp3'], ext, 'mp3');
        };
        /**
         * Convert Audio to Playable WhatsApp PTT
         * @param {Buffer} buffer Audio Buffer
         * @param {String} ext File Extension
         */
        this.toPTT = (buffer, ext) => {
            return this.ffmpeg(buffer, ['-vn', '-c:a', 'libopus', '-b:a', '128k', '-vbr', 'on', '-compression_level', '10'], ext, 'opus');
        };
        /**
         * Convert Audio to Playable WhatsApp Video
         * @param {Buffer} buffer Video Buffer
         * @param {String} ext File Extension
         */
        this.toVideo = (buffer, ext) => {
            return this.ffmpeg(buffer, ['-c:v', 'libx264', '-c:a', 'aac', '-ab', '128k', '-ar', '44100', '-crf', '32', '-preset', 'slow'], ext, 'mp4');
        };
        this.webpToMp4 = async (buffer) => {
            const tmpDir = 'tmp/' + function_1.default.uuid();
            await node_fs_1.default.promises.mkdir(tmpDir, { recursive: true });
            const inputPath = node_path_1.default.join(tmpDir, 'input.gif');
            const outputPath = node_path_1.default.join(tmpDir, 'output.mp4');
            try {
                const gifBuffer = await (0, sharp_1.default)(buffer, { animated: true }).gif().toBuffer();
                await node_fs_1.default.promises.writeFile(inputPath, gifBuffer);
                await new Promise((resolve, reject) => {
                    (0, fluent_ffmpeg_1.default)(inputPath)
                        .outputOptions([
                        '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=15',
                        '-c:v', 'libx264',
                        '-pix_fmt', 'yuv420p',
                        '-preset', 'ultrafast',
                        '-movflags', '+faststart'
                    ])
                        .format('mp4')
                        .save(outputPath)
                        .on('end', resolve)
                        .on('error', reject);
                });
                if (!node_fs_1.default.existsSync(outputPath) || node_fs_1.default.statSync(outputPath).size === 0)
                    throw new Error('FFmpeg failed to create an MP4 file.');
                return await node_fs_1.default.promises.readFile(outputPath);
            }
            finally {
                // 4. Bersih-bersih folder temporer
                await node_fs_1.default.promises.rm(tmpDir, { recursive: true, force: true }).catch(() => { });
            }
        };
    }
};
