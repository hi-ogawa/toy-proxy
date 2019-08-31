Toy Proxy

Control proxy behaviour via query parameters as below:

- url: string
- followRedirection: boolean
- requestHeadersOverride: object
- requestHeaderBlacklist: array(string) (e.g. to blacklist headers managed by browser)
- responseHeadersOverride: object
- responseHeaderBlacklist: array(string)
- responseStatusOverride: number

The proxy parses query paramters using `qs.parse`. So clients can use `qs.stringify`
to generate the query.

CORS related headers are enabled as follows:

- Access-Control-Allow-Origin: `process.env.ALLOW_ORIGIN` or *
- Access-Control-Allow-Methods: GET
- Access-Control-Allow-Headers-Headers: *
- Access-Control-Expose-Headers: *

```
# Development
$ npm run dev

# Testing
$ npm test

# Deployment
## as amazon lambda via zeit now (super generous free plan https://zeit.co/account/plan)
$ bash run deploy

## as cloud run conatiner (cf. https://github.com/hi-ogawa/cloud-run-script)
$ bash run.sh deploy
```
