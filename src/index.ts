import express from 'express'
import { paymentMiddlewareFromConfig } from '@x402/express'
import { HTTPFacilitatorClient } from '@x402/core/server'
import { ExactStellarScheme } from '@x402/stellar/exact/server'

const NETWORK = process.env.NETWORK as `${string}:${string}` ?? 'stellar:testnet'
const { FACILITATOR_URL, PRICE, PAY_TO } = process.env

if (!FACILITATOR_URL || !PRICE || !PAY_TO) {
  throw new Error('FACILITATOR_URL, PRICE, and PAY_TO must be set in the environment variables')
}

const app = express()

app.get('/', (_req, res) => {
  res.send(`Payment will be on ${NETWORK}`)
})

// Create x402 middleware config
app.use(
  paymentMiddlewareFromConfig(
    {
      [`GET /research`]: {
        accepts: {
          scheme: 'exact',
          price: PRICE,
          network: NETWORK,
          payTo: PAY_TO,
        },
      },
    },
    new HTTPFacilitatorClient({ url: FACILITATOR_URL }),
    [{ network: NETWORK, server: new ExactStellarScheme() }],
  ),
)

app.get('/research', (req, res) => {
  const { q } = req.query
  res.json({ query: q })
})

export default app
