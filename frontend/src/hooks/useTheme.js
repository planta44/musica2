import { useEffect } from 'react'
import { getSettings } from '../lib/api'

export const useTheme = () => {
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const { data } = await getSettings()
        
        if (data) {
          // Apply CSS variables to root
          const root = document.documentElement
          
          root.style.setProperty('--color-primary', data.primaryColor || '#9333ea')
          root.style.setProperty('--color-secondary', data.secondaryColor || '#000000')
          root.style.setProperty('--color-accent', data.accentColor || '#a855f7')
          root.style.setProperty('--color-background', data.backgroundColor || '#000000')
          
          // Update document title if artist name is set
          if (data.artistName && data.artistName !== 'Artist') {
            document.title = `${data.artistName} - Official Website`
          }
        }
      } catch (error) {
        console.error('Failed to load theme:', error)
      }
    }
    
    loadTheme()
    
    // Re-load theme every 30 seconds to catch updates
    const interval = setInterval(loadTheme, 30000)
    
    return () => clearInterval(interval)
  }, [])
}
