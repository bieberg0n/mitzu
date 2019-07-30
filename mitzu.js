"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
class Mitzu {
    constructor() {
        this.getRouters = {};
        this.postRouters = {};
        this.methodMap = {
            'GET': this.getRouters,
            'POST': this.postRouters,
        };
    }
    GET(path, callback) {
        this.getRouters[path] = callback;
    }
    POST(path, callback) {
        this.postRouters[path] = callback;
    }
    run(port) {
        let s = http_1.default.createServer((req, res) => {
            let router = this.methodMap[req.method];
            if (router === undefined) {
                res.writeHead(415);
            }
            else if (router[req.url] === undefined) {
                res.writeHead(404);
                // res.end()
            }
            else {
                // res.writeHead(200, {'Content-Type': 'text/html'})
                // res.write(this.getRouters[req.url!]())
                // res.end()
                this.getRouters[req.url](res);
            }
            res.end();
        });
        s.listen(port);
    }
}
exports.default = Mitzu;
