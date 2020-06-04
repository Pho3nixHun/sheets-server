const express = require('express');
const GoogleService = require('services/google')();

module.exports = (url) => {
    let router = express.Router();

    if (!GoogleService.initialized) {
        const authUrl = GoogleService.generateAuthUrl(`${url}/auth`);
        router.get('/auth', (req, res) => {
            const { code } = req.query || {};
            GoogleService.retrieveToken(code).then(() => {
                res.end('DONE');
                console.warn('Authorization completed. Process needs to be restarted!');
                process.exit(0);
            }, (err) => {
                res.end('FAILED');
                console.error('Authorization failed.', err.message);
            });
        });
        router.get('*', (req, res) => {
            res.redirect(authUrl);
            res.end();
        });
    }
    return router;
};
