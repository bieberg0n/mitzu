import Mitzu from './mitzu'

const App = new Mitzu()

App.GET('/', function () {
    return 'Hello, Mitzu!'
})

App.GET('/test', function () {
    return 'Hello, Test!'
})

App.run()
