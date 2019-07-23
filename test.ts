import Mitzu from './mitzu'

const App = new Mitzu()

App.route('/', 'GET', function () {
    return 'Hello, Mitzu!'
})

App.run()
