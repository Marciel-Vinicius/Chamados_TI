// backend/src/sse.js
const EventEmitter = require('events');
const notificationEmitter = new EventEmitter();
module.exports = notificationEmitter;

