"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = exports.AlyaApi = exports.Config = exports.Spam = exports.Converter = exports.Exif = exports.Scraper = exports.Function = exports.Connection = void 0;
require("dotenv/config");
const fs_1 = __importDefault(require("fs"));
const connection_1 = __importDefault(require("./lib/socket/connection"));
exports.Connection = connection_1.default;
const function_1 = __importDefault(require("./lib/system/function"));
exports.Function = function_1.default;
const scraper_1 = __importDefault(require("./lib/system/scraper"));
exports.Scraper = scraper_1.default;
const exif_1 = __importDefault(require("./lib/system/exif"));
exports.Exif = exif_1.default;
const converter_1 = __importDefault(require("./lib/system/converter"));
exports.Converter = converter_1.default;
const spam_1 = __importDefault(require("./lib/utils/spam"));
exports.Spam = spam_1.default;
const database_1 = __importDefault(require("./lib/database"));
exports.Database = database_1.default;
const api_1 = __importDefault(require("@alyachan/api"));
exports.AlyaApi = api_1.default;
const Config = JSON.parse(fs_1.default.readFileSync('./config.json', 'utf8'));
exports.Config = Config;
//# sourceMappingURL=index.js.map