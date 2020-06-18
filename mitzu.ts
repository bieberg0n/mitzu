import http, {IncomingMessage, OutgoingHttpHeaders, ServerResponse} from 'http'
import * as fs from "fs"
import mime from 'mime'
import {log} from './utils'
import io from 'socket.io'

class Response {
    statusCode: number = 200
    headers: OutgoingHttpHeaders = {'Content-Type': 'text/html'}
    content: any = ''
    rawRes: ServerResponse

    constructor(res: ServerResponse) {
        this.rawRes = res
    }

    alert (n: number) {
        this.statusCode = n
        this.write()
    }

    text(s: string) {
        this.headers = {'Content-Type': 'text/plain'}
        this.content = s
        this.write()
    }

    _file(filePath: string) {
        if (fs.existsSync(filePath)) {
            this.rawRes.writeHead(200, this.headers)
            fs.createReadStream(filePath).pipe(this.rawRes)
        } else {
            this.statusCode = 404
            this.write()
        }
    }

    html(filePath: string) {
        this._file(filePath)
    }

    file(filePath: string) {
        let t = mime.getType(filePath)
        // log(t)
        if (t === null) {
            this.statusCode = 404
            this.write()
        } else {
            this.headers = {'Content-Type': t}
            this._file(filePath)
        }
    }

    json(o: object) {
        this.headers = {'Content-Type': 'application/json'}
        this.content = JSON.stringify(o)
        this.write()
    }

    write() {
        this.rawRes.writeHead(this.statusCode, this.headers)
        this.rawRes.write(this.content)
        this.rawRes.end()
    }
}

export class Context {
    param: {[key: string]: string}
    req: IncomingMessage
    res: Response
    constructor (req: IncomingMessage, res: Response) {
        this.param = {}
        this.req = req
        this.res = res
    }
}

type Routers = {
    [key: string]: (c: Context) => void
}

const dynamicMatch = function(routeParts: string[], urlParts: string[]): [boolean, string[]] {
    let kv = ['', '']
    if (routeParts.length !== urlParts.length) {
        return [false, kv]
    }

    for (let i = 0; i < routeParts.length; i++) {
        let rP = routeParts[i]
        let uP = urlParts[i]
        if (/^<.+>$/.test(rP)) {
            kv = [rP.slice(1, -1), uP]
        } else if (rP !== uP) {
            return [false, kv]
        }
    }
    log(kv)
    return [true, kv]
}

export default class Mitzu {
    getRouters: Routers = {}
    postRouters: Routers = {}
    methodMap: {[key: string]: Routers} = {
        'GET': this.getRouters,
        'POST': this.postRouters,
    }

    GET(path: string, callback: (c: Context) => void) {
        this.getRouters[path] = callback
    }

    POST(path: string, callback: (c: Context) => void) {
        this.postRouters[path] = callback
    }

    handler(routers: Routers, url: string) {
        let urlParts = url.split('/')

        for (let route of Object.keys(routers)) {
            let routeParts = route.split('/')
            let [ok, kv] = dynamicMatch(routeParts, urlParts)
            if (ok) {
                return (c: Context) => {
                    if (kv[0] !== '') {
                        c.param[kv[0]] = kv[1]
                    }
                    return routers[route](c)
                }
            }
        }

        return (c: Context) => c.res.alert(404)
    }

    run(port: number, callbackBeforeRun: ((s: http.Server) => void) | null = null) {
        log(`Listen on ${port}...`)

        let s = http.createServer((req: IncomingMessage, res: ServerResponse) => {
            let resp = new Response(res)
            let routers = this.methodMap[req.method!]
            if (routers === undefined) {
                resp.alert(415)

            } else if (req.method === 'GET' && req.url!.startsWith('/static/')) {
                let filePath = '.' + req.url!
                resp.file(filePath)

            } else {
                let handle = this.handler(routers, req.url!)
                handle(new Context(req, resp))
            }
            log(new Date().toLocaleString(), req.method, req.url, resp.statusCode.toString())
        })

        if (callbackBeforeRun) {
            callbackBeforeRun(s)
        }

        s.listen(port)
    }
}
