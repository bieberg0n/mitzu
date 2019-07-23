"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
class Mitzu {
    constructor() {
        this.routers = {};
    }
    route(path, method, callback) {
        if (!this.routers[path]) {
            this.routers[path] = {};
        }
        this.routers[path][method] = callback;
    }
    run() {
        let s = http_1.default.createServer((req, res) => {
            for (let r in this.routers) {
                let router = this.routers[r];
                if (req.url == r && (router[req.method] !== undefined)) {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(router[req.method]());
                    res.end();
                    return;
                }
            }
            res.writeHead(404);
            res.end();
        });
        s.listen(8100);
    }
}
exports.default = Mitzu;
