const decodeBase64 = (b64) => Buffer.from(b64, 'base64').toString('ascii');

module.exports = (env, defaults) => {
    const { 
        CREDENTIALS = defaults.CREDENTIALS,
        SPREADSHEETID = defaults.SPREADSHEETID,
        SPREADSHEETRANGE = defaults.SPREADSHEETRANGE,
        PORT = defaults.PORT,
        HOST = defaults.HOST,
        TOKEN_FOLDER = defaults.TOKEN_PATH,
        OAUTH2PATH = defaults.OAUTH2PATH,
        DATAPATH = defaults.DATAPATH,
        CACHE_TIMEOUT = defaults.CACHE_TIMEOUT,
        CORS = defaults.CORS,
        LOGFORMAT = defaults.LOGFORMAT,
        FROM_EMAIL = defaults.FROM_EMAIL,
        TECHNICAL_EMAIL = defaults.TECHNICAL_EMAIL,
        SALES_EMAIL = defaults.SALES_EMAIL,
        HOSTNAME = defaults.HOSTNAME,
        WEBPROTOCOL = defaults.HOSTPROTOCOL,
        FILEID = defaults.FILEID
    } = env;
    const DECODED_CREDENTIALS = CREDENTIALS && decodeBase64(CREDENTIALS);

    return {
        CREDENTIALS: DECODED_CREDENTIALS,
        SPREADSHEETID,
        SPREADSHEETRANGE,
        PORT: parseInt(PORT),
        HOST,
        TOKEN_FOLDER,
        OAUTH2PATH,
        DATAPATH,
        CACHE_TIMEOUT: parseInt(CACHE_TIMEOUT),
        CORS: CORS == 'true',
        LOGFORMAT,
        FROM_EMAIL,
        TECHNICAL_EMAIL,
        SALES_EMAIL,
        HOSTNAME,
        WEBPROTOCOL,
        FILEID
    }
}