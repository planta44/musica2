import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Listen for real-time content updates
    this.socket.on('settings-updated', (data) => {
      this.emit('content-updated', { type: 'settings', data });
    });

    this.socket.on('about-created', (data) => {
      this.emit('content-updated', { type: 'about', action: 'created', data });
    });

    this.socket.on('about-updated', (data) => {
      this.emit('content-updated', { type: 'about', action: 'updated', data });
    });

    this.socket.on('about-deleted', (data) => {
      this.emit('content-updated', { type: 'about', action: 'deleted', data });
    });

    // Live event updates
    this.socket.on('live-event-created', (data) => {
      this.emit('live-event-updated', { action: 'created', data });
    });

    this.socket.on('live-event-updated', (data) => {
      this.emit('live-event-updated', { action: 'updated', data });
    });

    this.socket.on('live-event-deleted', (data) => {
      this.emit('live-event-updated', { action: 'deleted', data });
    });

    this.socket.on('live-event-started', (data) => {
      this.emit('live-event-updated', { action: 'started', data });
    });

    this.socket.on('live-event-ended', (data) => {
      this.emit('live-event-updated', { action: 'ended', data });
    });

    // Live event participants
    this.socket.on('participant-joined', (data) => {
      this.emit('participant-updated', { action: 'joined', data });
    });

    this.socket.on('participant-left', (data) => {
      this.emit('participant-updated', { action: 'left', data });
    });

    this.socket.on('participant-updated', (data) => {
      this.emit('participant-updated', { action: 'updated', data });
    });

    // WebRTC signaling
    this.socket.on('webrtc-offer', (data) => {
      this.emit('webrtc-offer', data);
    });

    this.socket.on('webrtc-answer', (data) => {
      this.emit('webrtc-answer', data);
    });

    this.socket.on('webrtc-ice-candidate', (data) => {
      this.emit('webrtc-ice-candidate', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join a live event room
  joinLiveEvent(eventId) {
    if (this.socket) {
      this.socket.emit('join-live-event', eventId);
    }
  }

  // Leave a live event room
  leaveLiveEvent(eventId) {
    if (this.socket) {
      this.socket.emit('leave-live-event', eventId);
    }
  }

  // WebRTC signaling methods
  sendOffer(eventId, offer, targetSocketId) {
    if (this.socket) {
      this.socket.emit('webrtc-offer', { eventId, offer, targetSocketId });
    }
  }

  sendAnswer(eventId, answer, targetSocketId) {
    if (this.socket) {
      this.socket.emit('webrtc-answer', { eventId, answer, targetSocketId });
    }
  }

  sendIceCandidate(eventId, candidate, targetSocketId) {
    if (this.socket) {
      this.socket.emit('webrtc-ice-candidate', { eventId, candidate, targetSocketId });
    }
  }

  // Event listener system
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  off(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in socket listener for ${event}:`, error);
        }
      });
    }
  }

  getSocketId() {
    return this.socket?.id;
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

const socketService = new SocketService();

export default socketService;
