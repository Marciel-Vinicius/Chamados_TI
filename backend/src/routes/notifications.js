// backend/src/routes/notifications.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { notificationEmitter } = require('../sse');

router.get('/stream', auth, (req, res) => {
    res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });
    res.flushHeaders?.();

    // ping pra não fechar em proxies
    const keepAlive = setInterval(() => res.write(`:keepalive\n\n`), 25000);

    const onNotify = (payload) => {
        // Se quiser filtrar por setor/role, use req.user aqui
        res.write(`event: message\n`);
        res.write(`id: ${payload.id}\n`);
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    notificationEmitter.on('notify', onNotify);

    req.on('close', () => {
        clearInterval(keepAlive);
        notificationEmitter.off('notify', onNotify);
    });
});

module.exports = router;
