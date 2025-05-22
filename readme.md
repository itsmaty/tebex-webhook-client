# IN DEVELOPMENT !!!

This library is intended to simplify the use of your Tebex Store´s Webhook Events.
It provides you with an simple API to subscribe to events and does all the heavy lifting like validation, ip-locking and signature verification for you.

# Usage (not working yet, just a draft)
## Installation
### 1. Install the library
To install the library with npm run the following command
```bash
npm install tebex-webhook-client
```
### 2. Import the `TebexWebhookClient` module
Frist you have to import the module
```js
import TebexWebhookClient from 'tebex-webhook-client';
```

### 3. Initiate a new `TebexWebhookClient`

```js
const WebhookClient = new TebexWebhookClient({
  secret: 'your-tebex-webhook-secret-key',
});
```
This is the minimal setup. It will create an instance of an express server internally, listen on port `80` and use `/webhook` as the endpoint.

However you may have an existing express instance in you evnironment or you want the chnage the listenting port or the name of endpoint
Yout can configure all this with the folloing parameters.

| Param | Type | Required | Default | Explaination |
|-------|------|----------|--------------|--------------|
| secret  | string  | yes | none | You Tebex Webhook Secret Key|
| express | express | no |  none | If you want to use an existing express server.<br>Also accepts an expressRouter |
| port | number | no | 80 | If you use the internal epress server. <br> The Port for that server to listen on. |
| endpoint | string | no | /webhook | The base route to listen for incoming webhook reqests.<br>Will be `yourip:port/baseRoute` <br>(ex. https://example.com/webhook) |
| ips | string[] | ['129.213.15.18', '192.168.1.1'] | none | An array of valid origin IP addresses for the webhooks.<br> Defaults to the IPs mentioned in the Tebex docs at time of writing this.|
| disableExpress | boolean | no | false | If you want to disable the usage of express and use the `ProcessRequestData` method to handle the request. |
| debugLog | boolean | no | false | If you want to enable console output for debugging.

## Register a Webhook in you Tebex Store
To actually receive events you have to register a webhookj in your Tebex Store.

1. Log into your Tebex Store and open the Creator Panel
2. Navigate to Integrations > Webhooks > Endpoints in the sidebar
3. Click on the `Add Endpoint` button
4. Check all events you want to receive
5. Add the URL of your webhook server (ex. `https://example.com/webhook`)
6. Click `Add`

Now Tebex will send a validation request to your webhook server.
This validation request will automatically be handled by the library.
If you get an error message, check the following things:
- have you added the correct webhook secret key?
- Is your server running?
- If you provided you own express instance, has it been configured correctly?
- Is your server listening on the correct port?
- Is that port open on wour machine or correctly forwarded?
- If you use a reverse proxy, is it configured correctly?


## Subscribe to an event
To subscribe to an event you have to call the `subscribe` method.
```ts
WebhookClient.Subscribe('payment.completed', (eventData: any, rawData: string) => {
  console.log('payment completed');
});

```

## Use without express
If you dont want to use express because you already have an WebServer of a different type (like a nextjs project)
No problem, you can disable the usage of express and use the `ProcessRequestData` method to handle the request.

```ts
WebhookClient.ProcessRequestData(ipAdress: string, signature: string, rawBody: string);
```

You have to provide the following parameters:
| Param | Type | Required | Default | Explaination |
|-------|------|----------|--------------|--------------|
| ipAdress  | string  | yes | none | The ip adress of the request origin |
| signature  | string  | yes | none | The `X-Signature` header of the request.<br>This header can´t be trusted if you have an untrusted proxy. |
| rawBody  | string  | yes | none | The raw body of the request |

Make sure to actually provide the raw body as text, if the body was parsed or somehow otherwise altered it can lead to an invalidating the signature and therefore failing the request.

# FAQ
## How can I use SSL/HTTPS
In my opinion ssl/https encryption is not the job of an application itself and especially not the one of a library.
You should use a reverse proxy like nginx or apache to handle ssl encryption.

## Where do i find the docker image?
Well, there is none.
This is a library where you have to add your own logic to make it usefuel, so there can´t be a prebuild image.
But of course you can host the build the application you build with this library as a docker container.

## Why do you use express?
Its planned to move it to native nodejs apis.


# ToDo
- Complete readme
- Correctly name types and interfaces
- Create proper Interfaces for all event types
- Remove express and use native nodejs apis instead
- Import alias @ for cleaner code
- console log and error messages
- add linter
- add tests
- add documentation / wiki page
- add github workflows
- add pr&issue templates