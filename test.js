"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mitzu_1 = __importDefault(require("./mitzu"));
const socket_io_1 = __importDefault(require("socket.io"));
const utils_1 = require("./utils");
const app = new mitzu_1.default();
app.GET('/', function (c) {
    c.res.text('hello mitzu!');
});
app.GET('/test', function (c) {
    c.res.text('hello, test!');
});
app.GET('/html', function (c) {
    c.res.html('./test.html');
});
app.GET('/api', function (c) {
    c.res.json({
        a: 'a',
        b: 2,
    });
});
app.GET('/user/<test>', function (c) {
    let v = c.param.test;
    c.res.text(`welcome! ${v}`);
});
const socketioCallback = function (s) {
    let ws = socket_io_1.default(s);
    ws.on('connection', (socket) => {
        utils_1.log('a user connected');
    });
    utils_1.log('io init over');
};
app.run(8100, socketioCallback);
