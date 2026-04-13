import 'dotenv/config'

const baseUrl = process.env.URL
const queryString = process.argv[2] || 'What are the latest news in quantum computing'
const query = encodeURIComponent(queryString)
const response = await fetch(`${baseUrl}/research?q=${query}`)
const data = await response.json()
console.log(data)
