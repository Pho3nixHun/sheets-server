const express = require('express');
const bodyParser = require('body-parser')
const SheetsServiceFactory = require('services/sheets');
const DriveServiceFactory = require('services/drive');
const SheetsService = SheetsServiceFactory();
const DriveService = DriveServiceFactory();

module.exports = ({ spreadsheetId, fileId, range, notificationResponseUrl }) => {
    const channelId = 'notification-channel';
    SheetsService.spreadsheetId = spreadsheetId
    SheetsService.range = range;
    const watchLoop = async () => {
        console.log('Requesting a channel to watch for changes...');
        const token = await DriveService.rewatch(channelId, fileId, notificationResponseUrl).catch(ex => false);
        if (token) {
            const ttl = token.expiration - Date.now() - 5000;
            console.log(`Watch channel created with ttl: ${ttl}`);
            setTimeout(watchLoop, ttl);
        }
    }
    watchLoop();
    
    const router = express.Router();
    router.post('/notification', async (req, res, next) => {
        SheetsService.invalidateCache();
        console.log('NOTIFICATION RECEIVED, CACHE INVALIDATED');
        res.end();
    });
    router.use(bodyParser.json({ type: 'application/json' }));
    router.get('/', async (req, res) => {
        const data = await SheetsService.read();
        res.json(data);
        res.end();
    });
    router.delete('/:id', async (req, res) => {
        const { id } = req.params;
        console.log('>>> DELETE', id);
        const result = await SheetsService.delete(item => item.id === id);
        res.json(result);
    })
    router.put('/:id', async (req, res) => {
        const data = await SheetsService.read();
        const { id } = req.params;
        const result = await SheetsService.update(id, data)
        console.log('>>> UPDATE', id);
        res.json(data.find(item => item.id === id));
    })
    router.post('/', async (req, res) => {
        const data = req.body;
        const result = await SheetsService.create(data);
        console.log('>>> CREATE', data);
        res.json(data);
    });
    return router;
};
