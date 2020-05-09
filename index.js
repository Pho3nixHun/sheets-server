// Add root to ignore relative paths
require('app-module-path').addPath(__dirname);

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');

const defaultConfig = require('default.config.json');
const config = require('lib/env-parser')(process.env, defaultConfig);

// Init GoogleService
require('services/google')({
    credentials: JSON.parse(config.CREDENTIALS).web,
    tokenPath: path.join(config.TOKEN_FOLDER, 'auth_token.json')
});

const basic = require('routes/basic')();
const oauth = require('routes/oauth')();
const products = require('routes/products')({ 
    spreadsheetId: config.SPREADSHEETID,
    fileId: config.FILEID,
    range: config.SPREADSHEETRANGE,
    notificationResponseUrl: `${config.WEBPROTOCOL}://${config.HOSTNAME}/products/notification`
});

(async () => {
    const logger = morgan(config.LOGFORMAT);
    const app = express();
    const root = express.Router();
    app.use(logger);
    root.use('/', basic);

    if (config.CORS) root.use(cors());
    app.use(root);
    app.use('/', oauth);
    app.use('/products', products);
    app.listen(config.PORT, config.HOST, () => {
        console.log(`Sheet-server listening on ${config.HOST}:${config.PORT}`);
    });

    return app;

})();
