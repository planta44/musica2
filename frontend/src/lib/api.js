import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken')
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/fan-club'
      }
    }
    return Promise.reject(error)
  }
)

// Auth
export const checkAdmin = (email) => api.post('/auth/check-admin', { email })
export const requestMagicLink = (email) => api.post('/auth/magic-link', { email })
export const verifyMagicLink = (token) => api.post('/auth/verify-magic', { token })
export const login = (email, passcode) => api.post('/auth/login', { email, passcode })

// Content
export const getSettings = () => api.get('/content/settings')
export const updateSettings = (data) => api.put('/content/settings', data)
export const getAboutSections = () => api.get('/content/about')
export const createAboutSection = (data) => api.post('/content/about', data)
export const updateAboutSection = (id, data) => api.put(`/content/about/${id}`, data)
export const deleteAboutSection = (id) => api.delete(`/content/about/${id}`)

// Music
export const getMusic = () => api.get('/music')
export const getMusicItem = (id) => api.get(`/music/${id}`)
export const createMusicItem = (data) => api.post('/music', data)
export const updateMusicItem = (id, data) => api.put(`/music/${id}`, data)
export const deleteMusicItem = (id) => api.delete(`/music/${id}`)
export const purchaseMusic = (id, customerEmail) => api.post(`/music/${id}/purchase`, { customerEmail })

// Videos
export const getVideos = () => api.get('/videos')
export const createVideo = (data) => api.post('/videos', data)
export const updateVideo = (id, data) => api.put(`/videos/${id}`, data)
export const deleteVideo = (id) => api.delete(`/videos/${id}`)

// Gallery
export const getAlbums = () => api.get('/gallery/albums')
export const getAlbum = (id) => api.get(`/gallery/albums/${id}`)
export const createAlbum = (data) => api.post('/gallery/albums', data)
export const updateAlbum = (id, data) => api.put(`/gallery/albums/${id}`, data)
export const deleteAlbum = (id) => api.delete(`/gallery/albums/${id}`)
export const addPhoto = (albumId, data) => api.post(`/gallery/albums/${albumId}/photos`, data)
export const updatePhoto = (id, data) => api.put(`/gallery/photos/${id}`, data)
export const deletePhoto = (id) => api.delete(`/gallery/photos/${id}`)

// Events
export const getEvents = () => api.get('/events')
export const getUpcomingEvents = () => api.get('/events/upcoming')
export const createEvent = (data) => api.post('/events', data)
export const updateEvent = (id, data) => api.put(`/events/${id}`, data)
export const deleteEvent = (id) => api.delete(`/events/${id}`)

// Merch
export const getMerch = () => api.get('/merch')
export const createMerchItem = (data) => api.post('/merch', data)
export const updateMerchItem = (id, data) => api.put(`/merch/${id}`, data)
export const deleteMerchItem = (id) => api.delete(`/merch/${id}`)

// Subscribers
export const subscribe = (email, name) => api.post('/subscribers/subscribe', { email, name })
export const joinFanClub = (email, name) => api.post('/subscribers/fan-club', { email, name })
export const getSubscribers = () => api.get('/subscribers')
export const getFanClubMembers = () => api.get('/subscribers/fan-club')
export const updateSubscriber = (id, data) => api.put(`/subscribers/${id}`, data)
export const deleteSubscriber = (id) => api.delete(`/subscribers/${id}`)
export const sendBroadcast = (subject, message, targetGroup) => api.post('/subscribers/broadcast', { subject, message, targetGroup })
export const exportSubscribers = () => api.get('/subscribers/export', { responseType: 'blob' })

// Payments
export const createMusicSession = (musicItemId, customerEmail) => api.post('/payments/stripe/create-music-session', { musicItemId, customerEmail })
export const createFanClubSession = (customerEmail, customerName) => api.post('/payments/stripe/create-fanclub-session', { customerEmail, customerName })
export const createDonationSession = (amount, customerEmail) => api.post('/payments/stripe/create-donation-session', { amount, customerEmail })
export const createLiveEventSession = (liveEventId, customerEmail) => api.post('/payments/stripe/create-live-session', { liveEventId, customerEmail })
export const verifySession = (sessionId) => api.get(`/payments/stripe/verify-session/${sessionId}`)
export const getPayments = () => api.get('/payments')

// Contact
export const submitContact = (data) => api.post('/contact', data)
export const getContactSubmissions = () => api.get('/contact')
export const deleteContactSubmission = (id) => api.delete(`/contact/${id}`)

// Admin
export const getDashboard = () => api.get('/admin/dashboard')
export const getAllContent = () => api.get('/admin/content/all')

// Upload
export const uploadFile = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/upload/single', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const uploadFiles = (files) => {
  const formData = new FormData()
  files.forEach(file => formData.append('files', file))
  return api.post('/upload/multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// Live Events
export const getLiveEvents = () => api.get('/live')
export const getUpcomingLiveEvents = () => api.get('/live/upcoming')
export const getLiveEvent = (id) => api.get(`/live/${id}`)
export const createLiveEvent = (data) => api.post('/live', data)
export const updateLiveEvent = (id, data) => api.put(`/live/${id}`, data)
export const deleteLiveEvent = (id) => api.delete(`/live/${id}`)
export const startLiveEvent = (id) => api.post(`/live/${id}/start`)
export const endLiveEvent = (id) => api.post(`/live/${id}/end`)
export const requestLiveAccess = (id, data) => api.post(`/live/${id}/access`, data)
export const verifyLiveAccess = (id, token) => api.post(`/live/${id}/verify-access`, { token })
export const joinLiveEvent = (id, data) => api.post(`/live/${id}/join`, data)
export const updateParticipant = (id, data) => api.put(`/live/${id}/participant`, data)
export const leaveLiveEvent = (id, subscriberId) => api.post(`/live/${id}/leave`, { subscriberId })

export default api
