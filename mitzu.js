"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const fs = __importStar(require("fs"));
const log = function (...args) {
    console.log(...args);
};
class Response {
    constructor() {
        this.statusCode = 200;
        this.headers = { content: 'text/html' };
        this.content = '';
    }
    str(s) {
        this.headers = { content: 'text/plain' };
        this.content = s;
    }
    html(filePath) {
        if (fs.existsSync(filePath)) {
            this.content = fs.readFileSync(filePath).toString();
        }
        else {
            this.statusCode = 404;
        }
    }
    file(filePath) {
        this.headers = { content: 'application/*' };
        this.html(filePath);
    }
    json(o) {
        this.headers = { content: 'application/json' };
        this.content = JSON.stringify(o);
    }
    write(res) {
        res.writeHead(this.statusCode, this.headers);
        res.write(this.content);
        res.end();
    }
}
class Context {
    constructor(req, res) {
        this.req = req;
        this.res = res;
    }
}
exports.Context = Context;
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
            let resp = new Response();
            let router = this.methodMap[req.method];
            if (router === undefined) {
                resp.statusCode = 415;
            }
            else if (req.method === 'GET' && req.url.startsWith('/static/')) {
                let filePath = '.' + req.url;
                resp.file(filePath);
            }
            else if (router[req.url] === undefined) {
                resp.statusCode = 404;
            }
            else {
                this.getRouters[req.url](new Context(req, resp));
            }
            resp.write(res);
            log(new Date().toLocaleString(), req.method, req.url, resp.statusCode.toString());
        });
        s.listen(port);
    }
}
exports.default = Mitzu;
