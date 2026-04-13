import express from 'express'
import { paymentMiddlewareFromConfig } from '@x402/express'
import { HTTPFacilitatorClient } from '@x402/core/server'
import { ExactStellarScheme } from '@x402/stellar/exact/server'
import { You } from '@youdotcom-oss/sdk';

const NETWORK = process.env.NETWORK as `${string}:${string}` ?? 'stellar:testnet'
const { FACILITATOR_URL, PRICE, PAY_TO, YDC_API_KEY } = process.env

if (!FACILITATOR_URL || !PRICE || !PAY_TO || !YDC_API_KEY) {
  throw new Error('FACILITATOR_URL, PRICE, PAY_TO, and YDC_API_KEY must be set in the environment variables')
}

const app = express()
const you = new You({ apiKeyAuth: YDC_API_KEY })

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

app.get('/research', async (req, res) => {
  const { q } = req.query
  if (!q || typeof q !== 'string') {
    res.status(400).json({ error: 'Query parameter "q" is required and must be a string' })
    return
  }

  const result  =  await you.research({
    input: q,
    researchEffort: 'standard',
  })
  console.log('Research result:', JSON.stringify(result, null, 2))

  res.json({ query: q, result: result.output.content })
})

export default app
