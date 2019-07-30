"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mitzu_1 = __importDefault(require("./mitzu"));
const App = new mitzu_1.default();
App.GET('/', function (res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('Hello, Mitzu!');
    // res.writeHead(200)
    // return
});
App.GET('/test', function (res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('Hello, Test!');
    // return 'Hello, Test!'
});
App.run(8100);
