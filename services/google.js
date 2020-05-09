const fs = require('fs');
const { google } = require('googleapis');
const fetch = require('node-fetch');

let TOKEN;
let OAUTH2CLIENT;
let CREDENTIALS;
let TOKENPATH;
let INITIALIZED = false;
const APIS = {};

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/drive.readonly'];
const ACCESSTYPE = 'offline';

const initializeOAuth2Client = ({ client_secret, client_id, redirect_uris }) => {
    if (!(client_secret && client_id && redirect_uris)) {
        throw new TypeError('client_secret, client_id and redirect_uris argument is mandatory');
    } 
    if (!OAUTH2CLIENT) {
        OAUTH2CLIENT = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    } else {
        console.warn('OAUTH2CLIENT was already initialized');
    }
    return OAUTH2CLIENT;
}

const readToken = (tokenPath) => {
    if (!TOKEN) {
        if (tokenPath) {
            try {
                const rawToken = fs.readFileSync(tokenPath);
                TOKEN = JSON.parse(rawToken);
            } catch (err) {
                return false;
            }
            return TOKEN;
        } else {
            throw new TypeError('tokenPath argument is mandatory');
        }
    }
    return TOKEN;
}

const saveToken = (tokenPath) => {
    if (TOKEN && tokenPath) {
        fs.writeFileSync(tokenPath, JSON.stringify(TOKEN))
    } else if (tokenPath) {
        throw new TypeError('no TOKEN is set yet')
    } else {
        throw new TypeError('tokenPath argument is mandatory');
    }
}

const generateAuthUrl = (redirect_uri) => {
    return OAUTH2CLIENT.generateAuthUrl({
        access_type: ACCESSTYPE,
        scope: SCOPES,
        redirect_uri,
        prompt: 'consent'
    });
}

const retrieveToken = (authCode) => {
    return new Promise((resolve, reject) => {
        OAUTH2CLIENT.getToken(authCode, (err, token) => {
            if (err) return reject(err);
            TOKEN = token;
            saveToken(TOKENPATH);
            resolve(token);
        });
    })
}

const initializeApis = (auth) => {
    APIS.Sheets = google.sheets({ version: 'v4', auth });
    APIS.Gmail = google.gmail({ version: 'v1', auth });
    APIS.Drive = google.drive({ version: 'v3', auth});
}

const initialize = ({ credentials, tokenPath }) => {
    if (!OAUTH2CLIENT) {
        TOKENPATH = tokenPath;
        CREDENTIALS = credentials;
        const token = TOKEN || readToken(tokenPath);
        OAUTH2CLIENT = initializeOAuth2Client(credentials); 
        if (token) {
            OAUTH2CLIENT.setCredentials(token);
            initializeApis(OAUTH2CLIENT);
            INITIALIZED = true;
        }
    }
    return INITIALIZED;
}

module.exports = ({ credentials, tokenPath } = {}) => {
    credentials && tokenPath && initialize({ credentials, tokenPath });
    return {
        get APIS() { return APIS; },
        get initialized() {
            return INITIALIZED;
        },
        generateAuthUrl,
        retrieveToken
    }
}