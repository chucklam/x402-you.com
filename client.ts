import 'dotenv/config'

const baseUrl = process.env.URL
const query = encodeURIComponent('What are the latest news in quantum computing')
const response = await fetch(`${baseUrl}/research?q=${query}`)
const data = await response.json()
console.log(data)
