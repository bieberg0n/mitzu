import http, {IncomingMessage, ServerResponse} from 'http'

type Routers = {
    [key: string]: (res: ServerResponse) => void
}

export default class Mitzu {
    getRouters: Routers = {}
    postRouters: Routers = {}
    methodMap: {[key: string]: Routers} = {
        'GET': this.getRouters,
        'POST': this.postRouters,
    }

    GET(path: string, callback: (res: ServerResponse) => void) {
        this.getRouters[path] = callback
    }

    POST(path: string, callback: (res: ServerResponse) => void) {
        this.postRouters[path] = callback
    }

    run(port: number) {
        let s = http.createServer((req: IncomingMessage, res: ServerResponse) => {
            let router = this.methodMap[req.method!]
            if (router === undefined) {
                res.writeHead(415)

            } else if (router[req.url!] === undefined) {
                res.writeHead(404)
                // res.end()

            } else {
                // res.writeHead(200, {'Content-Type': 'text/html'})
                // res.write(this.getRouters[req.url!]())
                // res.end()
                this.getRouters[req.url!](res)
            }
            res.end()
        })
        s.listen(port)
    }
}
