const { APIS: { Drive } } = require('services/google')();
module.exports = () => {
    return {
        async rewatch(id, resourceId, address) {
            const unwatchResponse = await this.unwatch(id, resourceId).catch(err => false);
            const watchResponse = await this.watch(id, resourceId, address).catch(err => false);
            //const isUnwatched = unwatchResponse.status >= 200 && unwatchResponse.status < 300;
            const isWatched = watchResponse.status >= 200 && watchResponse.status < 300;
            return isWatched && watchResponse.data;
        },
        async watch(id, resourceId, address) {
            return new Promise((resolve, reject) => {
                Drive.changes.watch({
                    pageToken: 1,
                    resource: {
                        id,
                        type: 'web_hook',
                        address,
                        resourceId
                    }
                }, (err, result) => err ? reject(err) : resolve(result));
            });
        },
        async unwatch(id, resourceId) {
            return new Promise((resolve, reject) => {
                Drive.channels.stop({
                    pageToken: 1,
                    resource: {
                        id,
                        resourceId
                    }
                }, (err, result) => err ? reject(err) : resolve(result));
            });
        }
    }
};