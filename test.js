"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mitzu_1 = __importDefault(require("./mitzu"));
const app = new mitzu_1.default();
app.GET('/', function (c) {
    c.res.str('hello mitzu!');
});
app.GET('/test', function (c) {
    c.res.str('hello, test!');
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
app.run(8100);
