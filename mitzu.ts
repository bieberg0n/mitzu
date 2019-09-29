import http, {IncomingMessage, OutgoingHttpHeaders, ServerResponse} from 'http'
import * as fs from "fs"
import mime from 'mime'

const log = function <T>(...args: T[]) {
    console.log(...args)
}

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
    req: IncomingMessage
    res: Response
    constructor (req: IncomingMessage, res: Response) {
        this.req = req
        this.res = res
    }
}

type Routers = {
    [key: string]: (c: Context) => void
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

    run(port: number) {
        log(`Listen on ${port}...`)

        let s = http.createServer((req: IncomingMessage, res: ServerResponse) => {
            let resp = new Response(res)
            let router = this.methodMap[req.method!]
            if (router === undefined) {
                resp.alert(415)

            } else if (req.method === 'GET' && req.url!.startsWith('/static/')) {
                let filePath = '.' + req.url!
                resp.file(filePath)

            } else if (router[req.url!] === undefined) {
                resp.alert(404)

            } else {
                this.getRouters[req.url!](new Context(req, resp))
            }
            log(new Date().toLocaleString(), req.method, req.url, resp.statusCode.toString())
        })
        s.listen(port)
    }
}
