# API for agents to do deep research independently

AI agents will require deep research for many tasks. Deep research capability is currently available from companies like you.com, but they require registration and pre-funding from the agent owners, making them a hassle to use. This project creates a deep research API that supports x402 payment, enabling agents to discover and use without setup from the agent owners.


## Set up
### CLI client (local)
The server is deployed to the cloud, thus any REST API client that supports x402 on Stellar can query it. For convenience and for demonstration, we've included a simple `client.ts` script that does exactly that. It's largely the same `client.js` sample code [provided by Stellar](https://developers.stellar.org/docs/build/agentic-payments/x402/quickstart-guide#create-clientjs), but rewritten in Typescript and with the endpoint pointed to our service.

#### To initialize
```
npm install
cp .env.example .env
```
The last command sets up the necessary environment variables with default ones. These defaults point to our server deployment (on Vercel) and uses Stellar testnet. You'll need to set `STELLAR_PRIVATE_KEY` to your testnet wallet's private key. If you don't already have a testnet wallet, follow Stellar's [instructions](https://developers.stellar.org/docs/build/agentic-payments/x402/quickstart-guide#setting-up-a-testnet-wallet) to set one up.

#### Try it out
Once you've done the setup, simply execute `npm run client "<some topic>"` to get back deeply researched answer to your topic in standard Markdown. Here are some examples to get you started!
```
npm run client "Latest news on the blockade in the Strait of Hormuz"
npm run client "The ecosystem for agentic payments"
npm run client "Latest discoveries in zero knowledge"
```

### Server (for local development)
To develop the server locally, you'll need to sign up at you.com and get an API key.

```
npm install
cp .env.example .env
```
After you've created the `.env` file, provide your you.com API key in `YDC_API_KEY` in the file.

Install Vercel's CLI tool if you don't already have it.
```
vc dev
```
This will run the server at http://localhost:3000. If you're using our CLI client (described above), change `RESOURCE_SERVER_UR` to `http://localhost:3000` in `.env` also. This tells the CLI client to use the local API service.
