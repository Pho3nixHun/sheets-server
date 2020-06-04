// Add root to ignore relative paths
require('app-module-path').addPath(__dirname);

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');

const CONFIG = require(process.env.SHEETS_SERVER_CONFIG);

const GOOGLE_CREDENTIALS = require(
    path.join(
        CONFIG['persistent-storage'],
        CONFIG['google-credentials-file']
    )
);
const TOKEN_PATH = path.join(
    CONFIG['persistent-storage'],
    CONFIG['google-refreshtoken-file']
);

// Init GoogleService
require('services/google')({
    credentials: GOOGLE_CREDENTIALS.web,
    tokenPath: TOKEN_PATH
});

const basic = require('routes/basic')();
const oauth = require('routes/oauth')(CONFIG.url);
const products = require('routes/products')({ 
    ...CONFIG.spreadsheet, 
    notificationResponseUrl: `${CONFIG.url}/products/notification`
});

(async ({ host, port, logformat, corsAllowed }) => {
    const logger = morgan(logformat);
    const app = express();
    const root = express.Router();
    app.use(logger);
    root.use('/', basic);

    corsAllowed && root.use(cors());
    app.use(root);
    app.use('/', oauth);
    app.use('/products', products);
    app.listen(port, host, () => {
        console.log(`Listening on ${host}:${port}.\n\tLog format: ${logformat}\n\tCors: ${corsAllowed}`);
    });

    return app;

})(CONFIG.server);
