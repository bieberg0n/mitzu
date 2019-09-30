import Mitzu, {Context} from './mitzu'
import {log} from './utils'

const app = new Mitzu()

app.GET('/', function (c: Context) {
    c.res.text('hello mitzu!')
})

app.GET('/test', function (c: Context) {
    c.res.text('hello, test!')
})

app.GET('/html', function (c: Context) {
    c.res.html('./test.html')
})

app.GET('/api', function (c: Context) {
    c.res.json({
        a: 'a',
        b: 2,
    })
})

app.GET('/user/<test>', function (c: Context) {
    let v = c.param.test
    c.res.text(`welcome! ${v}`)
})

app.run(8100)
