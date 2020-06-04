A quick overview of the configuration:

```json
{
  "persistent-storage": "/srv/persistent",
  "google-credentials-file": "google-credentials.json",
  "spreadsheet": {
      "spreadsheetId": "#REQUIRED",
      "range": "#REQUIRED",
      "cacheTimeout": 300000,
      "fileId": ""
  },
  "google-refreshtoken-file": "google-refreshtoken.json",
  "email": {
      "from": "#OPTIONAL",
      "technical": "#OPTIONAL",
      "sales": "#OPTIONAL"
  },
  "url": "http://example.com",
  "server": {
      "host": "127.0.0.1",
      "port": 8080,
      "logformat": "combined",
      "corsAllowed": false
  }
}
```

* `persistent-storage`
  * location of persistent storage in the container
* `google-credentials-file`
  * This is the filename the server will look for in `persistent-storage`
  * credentials aquired from [Google Dashboard](https://console.developers.google.com/)
* `spreadsheet`
  * configuration for the spreadsheet service
  * `spreadsheetId`
    * The id of the spreadsheet. If you open the spreadsheet in a browser, look for it in the URL.
  * `range`
    * Range of the spreadsheet to use. (This includes the sheet-name and the range)
  * `fileId`
    * Since Google stores the spreadsheet on google drive, we also need a `fileId` to be able to watch for changes and invalidate the cache if it's changed. 
    * (I obtained this by issuing the watch request with the `spreadsheetId` first and the service returned the `fileId`)
  * `cacheTimeout`
    * spreadsheet service keeps all data cached until a change occurs (through the service itself or through the notification channel from Google)
    * TTL after the cache invalidates itself.
* `google-refreshtoken-file`
  * the refresh token will be stored in the `persistent-storage` under this filename
* `email`
  * `from`
    * Emails sent from this address.
  * `technical`
    * Emails sent to this address in case of technical problem with the server.
  * `sales`
    * Emails sent to this address in case of business requests. (Related to the website's purpose. ex.: e-commerce)
* `url`
  * Hostname the site is hosted under. (This is required to forge the callback url for the Drive API)
* `server`
  * configuration for the http server (express)
  * `port`
    * Port express will listen on
  * `host`
    * Host express will listen on
  * `corsAllowed`
    * If this is `true` CORS requests will be allowed
  * `logformat`
    * Format of the log. You can find more about this in the documentation of [Morgan](https://github.com/expressjs/morgan)

  Once you have all variables set, just issue command ```npm start```

  At first start you need to authorize the server to access a few things at google. Once it is done, it will quit to remove the authorization route.
  Just start it again and you are done.