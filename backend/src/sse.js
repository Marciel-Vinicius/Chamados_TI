// backend/src/sse.js
const { EventEmitter } = require('events');
const notificationEmitter = new EventEmitter();
notificationEmitter.setMaxListeners(1000); // muitas conexões SSE ok
module.exports = { notificationEmitter };
