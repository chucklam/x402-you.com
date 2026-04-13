import express from 'express'

const app = express()

app.get('/', (_req, res) => {
  res.send(`Payment will be on ${process.env.NETWORK}`)
})

app.get('/research', (req, res) => {
  const { q } = req.query
  res.json({ query: q })
})

export default app
