"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mitzu_1 = __importDefault(require("./mitzu"));
const App = new mitzu_1.default();
App.route('/', 'GET', function () {
    return 'Hello, Mitzu!';
});
App.run();
