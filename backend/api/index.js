"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const serverless_http_1 = __importDefault(require("serverless-http"));
const index_1 = __importDefault(require("../src/index"));
const connectdb_1 = __importDefault(require("../src/config/connectdb"));
let handler = null;
let isConnected = false;
async function default_1(req, res) {
    if (!isConnected) {
        // ensure DB connection once per serverless instance
        try {
            await (0, connectdb_1.default)();
            isConnected = true;
        }
        catch (err) {
            console.error('DB connection failed in serverless handler', err);
            res.status(500).send('Database connection error');
            return;
        }
    }
    if (!handler) {
        handler = (0, serverless_http_1.default)(index_1.default);
    }
    return handler(req, res);
}
