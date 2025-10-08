import axios from 'axios'

const API_BASE_URL = 'http://localhost:3001'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
})

async function testAPI() {
  try {
    console.log('Testing settings endpoint...')
    const response = await api.get('/content/settings')
    console.log('Settings response:', response.data)
  } catch (error) {
    console.error('Settings error:', error.response?.data || error.message)
  }

  try {
    console.log('Testing about endpoint...')
    const response = await api.get('/content/about')
    console.log('About response:', response.data)
  } catch (error) {
    console.error('About error:', error.response?.data || error.message)
  }
}

testAPI()
