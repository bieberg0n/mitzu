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
const mime_1 = __importDefault(require("mime"));
const log = function (...args) {
    console.log(...args);
};
class Response {
    constructor(res) {
        this.statusCode = 200;
        this.headers = { 'Content-Type': 'text/html' };
        this.content = '';
        this.rawRes = res;
    }
    alert(n) {
        this.statusCode = n;
        this.write();
    }
    text(s) {
        this.headers = { 'Content-Type': 'text/plain' };
        this.content = s;
        this.write();
    }
    _file(filePath) {
        if (fs.existsSync(filePath)) {
            this.rawRes.writeHead(200, this.headers);
            fs.createReadStream(filePath).pipe(this.rawRes);
        }
        else {
            this.statusCode = 404;
            this.write();
        }
    }
    html(filePath) {
        this._file(filePath);
    }
    file(filePath) {
        let t = mime_1.default.getType(filePath);
        // log(t)
        if (t === null) {
            this.statusCode = 404;
            this.write();
        }
        else {
            this.headers = { 'Content-Type': t };
            this._file(filePath);
        }
    }
    json(o) {
        this.headers = { 'Content-Type': 'application/json' };
        this.content = JSON.stringify(o);
        this.write();
    }
    write() {
        this.rawRes.writeHead(this.statusCode, this.headers);
        this.rawRes.write(this.content);
        this.rawRes.end();
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
            let resp = new Response(res);
            let router = this.methodMap[req.method];
            if (router === undefined) {
                resp.alert(415);
            }
            else if (req.method === 'GET' && req.url.startsWith('/static/')) {
                let filePath = '.' + req.url;
                resp.file(filePath);
            }
            else if (router[req.url] === undefined) {
                resp.alert(404);
            }
            else {
                this.getRouters[req.url](new Context(req, resp));
            }
            log(new Date().toLocaleString(), req.method, req.url, resp.statusCode.toString());
        });
        s.listen(port);
    }
}
exports.default = Mitzu;
