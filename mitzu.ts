import http, {IncomingMessage, OutgoingHttpHeaders, ServerResponse} from 'http'
import * as fs from "fs"

const log = function <T>(...args: T[]) {
    console.log(...args)
}

class Response {
    statusCode: number = 200
    headers: OutgoingHttpHeaders = {content: 'text/html'}
    content: any = ''

    str(s: string) {
        this.headers = {content: 'text/plain'}
        this.content = s
    }

    html(filePath: string) {
        if (fs.existsSync(filePath)) {
            this.content = fs.readFileSync(filePath).toString()
        } else {
            this.statusCode = 404
        }
    }

    file(filePath: string) {
        this.headers = {content: 'application/*'}
        this.html(filePath)
    }

    json(o: object) {
        this.headers = {content: 'application/json'}
        this.content = JSON.stringify(o)
    }

    write(res: ServerResponse) {
        res.writeHead(this.statusCode, this.headers)
        res.write(this.content)
        res.end()
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
        let s = http.createServer((req: IncomingMessage, res: ServerResponse) => {
            let resp = new Response()
            let router = this.methodMap[req.method!]
            if (router === undefined) {
                resp.statusCode = 415

            } else if (req.method === 'GET' && req.url!.startsWith('/static/')) {
                let filePath = '.' + req.url!
                resp.file(filePath)

            } else if (router[req.url!] === undefined) {
                resp.statusCode = 404

            } else {
                this.getRouters[req.url!](new Context(req, resp))
            }
            resp.write(res)
            log(new Date().toLocaleString(), req.method, req.url, resp.statusCode.toString())
        })
        s.listen(port)
    }
}
