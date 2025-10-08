// Utility functions

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

/**
 * Convert relative URLs to absolute URLs
 * If URL starts with /uploads, prepend backend URL
 */
export const getMediaUrl = (url) => {
  if (!url) return null
  
  // If already absolute URL (http/https), return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // If relative URL starting with /uploads, prepend backend URL
  if (url.startsWith('/uploads')) {
    return `${API_BASE_URL}${url}`
  }
  
  // Return as is
  return url
}

/**
 * Format currency
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

/**
 * Format date
 */
export const formatDate = (date, format = 'long') => {
  const options = format === 'long' 
    ? { year: 'numeric', month: 'long', day: 'numeric' }
    : { year: 'numeric', month: 'short', day: 'numeric' }
  
  return new Date(date).toLocaleDateString('en-US', options)
}
