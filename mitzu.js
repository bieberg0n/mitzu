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
const utils_1 = require("./utils");
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
        this.param = {};
        this.req = req;
        this.res = res;
    }
}
exports.Context = Context;
const dynamicMatch = function (routeParts, urlParts) {
    let kv = ['', ''];
    if (routeParts.length !== urlParts.length) {
        return [false, kv];
    }
    for (let i = 0; i < routeParts.length; i++) {
        let rP = routeParts[i];
        let uP = urlParts[i];
        if (/^<.+>$/.test(rP)) {
            kv = [rP.slice(1, -1), uP];
        }
        else if (rP !== uP) {
            return [false, kv];
        }
    }
    utils_1.log(kv);
    return [true, kv];
};
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
    handler(routers, url) {
        let urlParts = url.split('/');
        for (let route of Object.keys(routers)) {
            let routeParts = route.split('/');
            let [ok, kv] = dynamicMatch(routeParts, urlParts);
            if (ok) {
                return (c) => {
                    if (kv[0] !== '') {
                        c.param[kv[0]] = kv[1];
                    }
                    return routers[route](c);
                };
            }
        }
        return (c) => c.res.alert(404);
    }
    run(port) {
        utils_1.log(`Listen on ${port}...`);
        let s = http_1.default.createServer((req, res) => {
            let resp = new Response(res);
            let routers = this.methodMap[req.method];
            if (routers === undefined) {
                resp.alert(415);
            }
            else if (req.method === 'GET' && req.url.startsWith('/static/')) {
                let filePath = '.' + req.url;
                resp.file(filePath);
            }
            else {
                let handle = this.handler(routers, req.url);
                handle(new Context(req, resp));
            }
            utils_1.log(new Date().toLocaleString(), req.method, req.url, resp.statusCode.toString());
        });
        s.listen(port);
    }
}
exports.default = Mitzu;
