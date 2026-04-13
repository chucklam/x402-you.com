import { Transaction, TransactionBuilder } from '@stellar/stellar-sdk'
import { x402Client, x402HTTPClient } from '@x402/fetch'
import { createEd25519Signer, getNetworkPassphrase } from '@x402/stellar'
import { ExactStellarScheme } from '@x402/stellar/exact/client'
import pc from 'picocolors'

import 'dotenv/config'
const { NETWORK, RESOURCE_SERVER_URL, STELLAR_RPC_URL, STELLAR_PRIVATE_KEY } = process.env

if (!NETWORK || !RESOURCE_SERVER_URL || !STELLAR_PRIVATE_KEY) {
  throw new Error('NETWORK, RESOURCE_SERVER_URL, and STELLAR_PRIVATE_KEY must be set in the environment variables')
}
const network = NETWORK as `${string}:${string}`


// Configure x402 client (and x402 HTTP client)
const signer = createEd25519Signer(STELLAR_PRIVATE_KEY, network)
const rpcConfig = STELLAR_RPC_URL ? { url: STELLAR_RPC_URL } : undefined
const client = new x402Client().register(
  'stellar:*',
  new ExactStellarScheme(signer, rpcConfig),
)
const httpClient = new x402HTTPClient(client)


// Construct the resource URL we'll be calling, taking the query from the command line arguments.
const queryString = process.argv[2] || 'What are the latest news in quantum computing'
const query = encodeURIComponent(queryString)
const url = `${RESOURCE_SERVER_URL}/research?q=${query}`


// First try fetching the resource, which should trigger 402 error (and thus the payment flow)
const firstTry = await fetch(url)
const data = await firstTry.json()
// console.log(`Payment requested: ${firstTry.status}`)
// console.log(data)


// Response includes payment instructions
const paymentRequired = httpClient.getPaymentRequiredResponse((name) =>
  firstTry.headers.get(name),
)
// console.log('Payment required response:', JSON.stringify(paymentRequired, null, 2))
const amount = paymentRequired.accepts.find((a) => a.scheme === 'exact')?.amount
if (amount) {
  const cost = Number(amount) / 1e7 // USDC on Stellar has 7 decimals
  console.log(pc.green(`Cost of the answer in USDC: ${cost}\n`))
}


// Create payment payload using the payment instructions.
let paymentPayload = await client.createPaymentPayload(paymentRequired)
const networkPassphrase = getNetworkPassphrase(network)
const tx = new Transaction(
  paymentPayload.payload.transaction as string,
  networkPassphrase,
)
const sorobanData = tx.toEnvelope().v1()?.tx()?.ext()?.sorobanData()

// Configure fee to 1 stroop, prevents testnet facilitator limit issue
if (sorobanData) {
  paymentPayload = {
    ...paymentPayload,
    payload: {
      ...paymentPayload.payload,
      transaction: TransactionBuilder.cloneFrom(tx, {
        fee: '1',
        sorobanData,
        networkPassphrase,
      })
        .build()
        .toXDR(),
    },
  }
}


// Re-try fetching the resource, but this time include the payment payload.
const paymentHeaders = httpClient.encodePaymentSignatureHeader(paymentPayload)
const paidResponse = await fetch(url, {
  method: 'GET',
  headers: paymentHeaders,
})

// console.log(`Access Granted! ${paidResponse.status}`)
// const paymentResponse = httpClient.getPaymentSettleResponse((name) =>
//   paidResponse.headers.get(name),
// )
// console.log('Settlement response:', paymentResponse)

const { result } = await paidResponse.json()
console.log(result)
