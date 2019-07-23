import http, {IncomingMessage, ServerResponse} from 'http'

type Routers = {
    [key: string]: () => string
}

export default class Mitzu {
    getRouters: Routers = {}
    postRouters: Routers = {}
    methodMap: {[key: string]: Routers} = {
        'GET': this.getRouters,
        'POST': this.postRouters,
    }

    GET(path: string, callback: () => string) {
        this.getRouters[path] = callback
    }

    POST(path: string, callback: () => string) {
        this.postRouters[path] = callback
    }

    run() {
        let s = http.createServer((req: IncomingMessage, res: ServerResponse) => {
            let router = this.methodMap[req.method!]
            if (router === undefined) {
                res.writeHead(415)

            } else if (router[req.url!] === undefined) {
                res.writeHead(404)
                res.end()

            } else {
                res.writeHead(200, {'Content-Type': 'text/html'})
                res.write(this.getRouters[req.url!]())
                res.end()
            }
        })
        s.listen(8100)
    }
}
