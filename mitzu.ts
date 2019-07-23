import http, {IncomingMessage, ServerResponse} from 'http'

type Routers = {
    [key: string]: {[key: string]: () => string}
}

export default class Mitzu {
    routers: Routers = {}

    route(path: string, method: string, callback: () => string) {
        if (!this.routers[path]) {
            this.routers[path] = {}
        }
        this.routers[path][method] = callback
    }

    run() {
        let s = http.createServer((req: IncomingMessage, res: ServerResponse) => {
            for (let r in this.routers) {
                let router = this.routers[r]
                if (req.url == r && (router[req.method!] !== undefined)) {
                    res.writeHead(200, {'Content-Type': 'text/html'})
                    res.write(router[req.method!]())
                    res.end()
                    return
                }
            }
            res.writeHead(404)
            res.end()
        })
        s.listen(8100)
    }
}
