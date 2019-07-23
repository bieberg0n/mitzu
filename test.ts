import Mitzu from './mitzu'

const App = new Mitzu()

App.route('/', 'GET', function () {
    return 'Hello, Mitzu!'
})

App.route('/test', 'GET', function () {
    return 'Hello, Test!'
})

App.run()
