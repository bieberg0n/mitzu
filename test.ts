import {ServerResponse} from 'http'
import Mitzu from './mitzu'

const App = new Mitzu()

App.GET('/', function (res: ServerResponse) {
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.write('Hello, Mitzu!')
    // res.writeHead(200)
    // return
})

App.GET('/test', function (res: ServerResponse) {
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.write('Hello, Test!')
    // return 'Hello, Test!'
})

App.run(8100)
