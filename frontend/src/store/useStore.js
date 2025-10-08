import { create } from 'zustand'
import socketService from '../lib/socket'

export const useStore = create((set, get) => ({
  // Auth state
  isAdmin: false,
  adminEmail: null,
  setAdmin: (isAdmin, email) => set({ isAdmin, adminEmail: email }),
  logout: () => {
    localStorage.removeItem('adminToken')
    set({ isAdmin: false, adminEmail: null })
  },

  // Music player state
  currentTrack: null,
  isPlaying: false,
  playerOpen: false,
  setCurrentTrack: (track) => set({ currentTrack: track, isPlaying: true, playerOpen: true }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setPlayerOpen: (open) => set({ playerOpen: open }),

  // Settings
  settings: null,
  setSettings: (settings) => set({ settings }),

  // Loading states
  loading: false,
  setLoading: (loading) => set({ loading }),

  // Real-time updates
  contentUpdateTrigger: 0,
  triggerContentUpdate: () => set((state) => ({ contentUpdateTrigger: state.contentUpdateTrigger + 1 })),

  // Live events
  liveEvents: [],
  setLiveEvents: (events) => set({ liveEvents: events }),
  currentLiveEvent: null,
  setCurrentLiveEvent: (event) => set({ currentLiveEvent: event }),

  // Initialize socket connection
  initSocket: () => {
    socketService.connect();

    // Listen for content updates
    socketService.on('content-updated', (data) => {
      console.log('Content updated:', data);
      get().triggerContentUpdate();
      
      // Update settings if changed
      if (data.type === 'settings') {
        get().setSettings(data.data);
      }
    });

    // Listen for live event updates
    socketService.on('live-event-updated', (data) => {
      console.log('Live event updated:', data);
      get().triggerContentUpdate();
    });
  },

  // Cleanup socket
  cleanupSocket: () => {
    socketService.disconnect();
  }
}))
