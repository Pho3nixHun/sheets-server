const { APIS: { Sheets } } = require('services/google')();
const Cache = require('lib/cache');
const { promisify } = require('util');

let SPREADSHEETID;
let SPREADSHEETRANGE;

let transformRowToObject = (headers, row) => {
    return headers.reduce((acc, header, index) => {
        acc[header] = row[index];
        return acc;
    }, {});
}

const defaultSelector = () => false;
module.exports = () => {
    let cache = new Cache(1000*60*10);
    return {
        spreadsheetId: null,
        range: null,
        get cacheTimeout() {
            return cache.ttl;
        },
        set cacheTimeout(value) {
            return cache = new Cache(value);
        },
        get rangeDefinition() {
            const r = this.range;
            if (!r) return false;
            const execResult = /^([A-Za-z0-9\-\.\_]+\!)?([A-Z]+)([0-9]+)?\:([A-Z]+)([0-9]+)?$/g.exec(r);
            if (!execResult) return false;
            const [range, sheet, startColumn, startRow = 1, endColumn, endRow] = execResult;
            return {
                get range() {
                    return `${this.sheet}!${this.startColumn}${this.startRow || ''}:${this.endColumn}${this.endRow || ''}`
                },
                sheet: sheet.replace('!',''),
                startColumn,
                startRow,
                endColumn,
                endRow
            }
        },
        valueRenderOption: 'UNFORMATTED_VALUE',
        valueInputOption: "USER_ENTERED",
        get isSetup() {
            return (this.spreadsheetId || this.range);
        },
        create(values) {
            return new Promise((resolve, reject) => {
                Sheets.spreadsheets.values.append({
                    spreadsheetId: this.spreadsheetId,
                    range: this.range,
                    valueInputOption: this.valueInputOption,
                    resource: {
                        values: [values]
                    }
                }, (err, response) => err ? reject(err) : resolve(response));
            })
        },
        read(skipCache = false) {
            if (!this.isSetup) {
                return Promise.reject('spreadsheetId or range is not present');
            }
            if (cache.isValid && !skipCache) {
                console.log('READ FROM CACHE');
                return Promise.resolve(cache.value);
            }
            const { spreadsheetId, range, rangeDefinition } = this;
            return new Promise((resolve, reject) => {
                Sheets.spreadsheets.values.get({
                    spreadsheetId,
                    range,
                    valueRenderOption: this.valueRenderOption
                }, (err, res) => {
                    if (err) return reject(err);
                    const headers = res.data.values.shift();
                    cache.value = res.data.values
                        .map(transformRowToObject.bind(null, headers));
                    console.log('READ FROM SERVICE');
                    return resolve(cache.value);
                });
            })
        },
        update(where = defaultSelector, data) {
            const rd = this.rangeDefinition;
            if (
                (rd.startrow && line < rd.startRow) ||
                (rd.endRow && line > rd.endRow)
            ) {
                return Promise.reject(new Error('Out of bounds'));
            }
            rd.startRow = line;
            rd.endRow = line;
            return new Promise((resolve, reject) => {
                Sheets.spreadsheets.values.update({
                    spreadsheetId: this.spreadsheetId,
                    range: rd.range,
                    valueInputOption: this.valueInputOption,
                    resource: {
                        values: [data]
                    }
                }, (err, response) => err ? reject(err) : resolve(response))
            })
        },
        invalidateCache() {
            cache.invalidate();
        },
        async delete(where = defaultSelector) {
            const rd = this.rangeDefinition;
            const data = await this.read(true);
            const line = data.findIndex(where);
            if (
                (rd.startrow && line < rd.startRow) ||
                (rd.endRow && line > rd.endRow) ||
                line < 1
            ) {
                return Promise.reject(new Error('Out of bounds'));
            }
            rd.endRow = rd.startRow + line + 1 /* Header */;
            rd.startRow = rd.startRow + line + 1 /* Header */;
            // return Promise.resolve(rd.range);
            return new Promise((resolve, reject) => {
                Sheets.spreadsheets.values.clear({
                    spreadsheetId: this.spreadsheetId,
                    range: rd.range,
                    resource: { }
                }, (err, response) => {
                    if (err) return reject({err, range: rd.range});
                    this.invalidateCache();
                    resolve({ response, data: data[line] });
                })
            })
        }
    }
};
