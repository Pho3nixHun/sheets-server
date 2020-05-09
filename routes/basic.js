const express = require('express');
const package = require('package.json');

module.exports = () => {
    const router = express.Router();
    router.get('/version', (req, res) => {
        res.end(`${package.name} ${package.version}`);
    });
    return router;
};
