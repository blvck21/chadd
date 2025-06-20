import { create } from 'zustand';
import { Socket } from 'socket.io-client';
import { User, Room, VoiceConnection } from '../types';

interface VoiceState {
  // Connection state
  socket: Socket | null;
  isConnected: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  
  // Server connection details
  serverHost: string;
  serverPort: number;
  
  // Server info
  serverInfo: {
    name?: string;
    description?: string;
    motd?: string;
    maxUsers?: number;
    currentUsers?: number;
    version?: string;
    uptime?: number;
    requirePassword?: boolean;
  } | null;
  
  // User state
  currentUser: User | null;
  username: string;
  
  // Room state
  currentRoom: Room | null;
  rooms: Room[];
  availableRooms: Room[];
  roomUsers: Map<string, User[]>;
  
  // Voice connections
  voiceConnections: Map<string, VoiceConnection>;
  localStream: MediaStream | null;
  audioStreams: Map<string, MediaStream>;
  speakingUsers: Set<string>;
  
  // Voice Activity Detection
  audioContext: AudioContext | null;
  analyserNode: AnalyserNode | null;
  gainNode: GainNode | null;
  vadInterval: NodeJS.Timeout | null;
  
  // Visual Voice Activity (always runs for visualization)
  visualAudioContext: AudioContext | null;
  visualAnalyserNode: AnalyserNode | null;
  visualVadInterval: NodeJS.Timeout | null;
  currentInputLevel: number; // 0-100 for raw input level (before threshold)
  currentOutputLevel: number; // 0-100 for processed output level (after threshold)
  
  // Audio settings and controls
  audioSettings: {
    inputDeviceId: string;
    outputDeviceId: string;
    inputVolume: number;
    outputVolume: number;
    micSensitivity: number;
    noiseSuppression: boolean;
    echoCancellation: boolean;
    autoGainControl: boolean;
    // Voice Activity Detection settings
    vadEnabled: boolean;
    vadThreshold: number;
    vadSmoothingTimeConstant: number;
    vadDebounceTime: number;
    // Voice transmission modes
    voiceMode: 'vad' | 'ptt' | 'always' | 'raw'; // Voice Activity Detection, Push-to-Talk, Always On, Raw Audio
    pttKey: string;
  };
  
  // Chat
  chatMessages: Map<string, any[]>;
  
  // Mute states and volume controls
  isMuted: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;
  wasManuallyMuted: boolean; // Track if user was muted before deafening
  micVolume: number;
  speakerVolume: number;
  
  // Push-to-talk state
  isPttPressed: boolean;
  
  // Settings modal
  showSettings: boolean;
  showServerSettings: boolean;
  serverConfig: any;
}

interface VoiceActions {
  // Connection actions
  setSocket: (socket: Socket | null) => void;
  setIsConnected: (connected: boolean) => void;
  setConnectionStatus: (status: VoiceState['connectionStatus']) => void;
  setServerInfo: (info: VoiceState['serverInfo']) => void;
  setServerConnection: (host: string, port: number) => void;
  disconnect: () => void;
  
  // User actions
  setCurrentUser: (user: User | null) => void;
  setUsername: (username: string) => void;
  
  // Room actions
  setCurrentRoom: (room: Room | null) => void;
  setRooms: (rooms: Room[]) => void;
  setAvailableRooms: (rooms: Room[]) => void;
  updateRoom: (roomId: string, updates: Partial<Room>) => void;
  addRoom: (room: Room) => void;
  removeRoom: (roomId: string) => void;
  joinRoom: (roomId: string, username?: string) => void;
  leaveRoom: () => void;
  refreshRooms: () => void;
  getRoomUsers: (roomId: string) => void;
  
  // Voice actions
  setVoiceConnection: (userId: string, connection: VoiceConnection) => void;
  removeVoiceConnection: (userId: string) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setupAudioProcessing: (stream: MediaStream) => void;
  addAudioStream: (userId: string, stream: MediaStream) => void;
  removeAudioStream: (userId: string) => void;
  setSpeakingUser: (userId: string, speaking: boolean) => void;
  startVoiceActivityDetection: () => void;
  stopVoiceActivityDetection: () => void;
  
  // Visual Voice Activity (for input level display)
  startVisualVoiceActivityDetection: () => void;
  stopVisualVoiceActivityDetection: () => void;
  
  // Audio actions
  updateAudioSettings: (settings: Partial<VoiceState['audioSettings']>) => void;
  setMuted: (muted: boolean) => void;
  setDeafened: (deafened: boolean) => void;
  setSpeaking: (speaking: boolean) => void;
  setMicVolume: (volume: number) => void;
  setSpeakerVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleDeafen: () => void;
  
  // Push-to-talk actions
  setPttPressed: (pressed: boolean) => void;
  initializePttListeners: () => void;
  removePttListeners: () => void;
  
  // Chat actions
  sendChatMessage: (message: string) => void;
  sendGlobalChatMessage: (message: string) => void;
  addChatMessage: (roomId: string, message: any) => void;
  loadChatHistory: (roomId: string) => Promise<void>;
  
  // UI actions
  setShowSettings: (show: boolean) => void;
  setShowServerSettings: (show: boolean) => void;
  setServerConfig: (config: any) => void;
  requestMicrophoneAccess: () => Promise<void>;
  
  // WebRTC actions
  handleOffer: (fromUserId: string, offer: RTCSessionDescriptionInit, audioConfig?: any) => Promise<void>;
  handleAnswer: (fromUserId: string, answer: RTCSessionDescriptionInit) => Promise<void>;
  handleIceCandidate: (fromUserId: string, candidate: RTCIceCandidateInit) => Promise<void>;
  initiateWebRTCConnection: (targetUserId: string) => Promise<void>;
}

const defaultAudioSettings = {
  inputDeviceId: 'default',
  outputDeviceId: 'default',
  inputVolume: 100,
  outputVolume: 100,
  micSensitivity: 50,
  noiseSuppression: false, // Disable by default to prevent wavy audio
  echoCancellation: true,
  autoGainControl: false, // Disable by default to prevent wavy audio
  // Voice Activity Detection settings
  vadEnabled: true,
  vadThreshold: 15, // Lower threshold for better sensitivity
  vadSmoothingTimeConstant: 0.8, // Higher for smoother detection
  vadDebounceTime: 150, // Slightly higher for less choppy detection
  // Voice transmission modes
  voiceMode: 'vad',
  pttKey: 'Space',
};

export const useVoiceStore = create<VoiceState & VoiceActions>((set, get) => ({
  // Initial state
  socket: null,
  isConnected: false,
  connectionStatus: 'disconnected',
  serverHost: '',
  serverPort: 0,
  serverInfo: null,
  currentUser: null,
  username: localStorage.getItem('CHADD-username') || '',
  currentRoom: null,
  rooms: [],
  availableRooms: [],
  roomUsers: new Map(),
  voiceConnections: new Map(),
  localStream: null,
  audioStreams: new Map(),
  speakingUsers: new Set(),
  audioContext: null,
  analyserNode: null,
  gainNode: null,
  vadInterval: null,
  
  // Visual Voice Activity
  visualAudioContext: null,
  visualAnalyserNode: null,
  visualVadInterval: null,
  currentInputLevel: 0,
  currentOutputLevel: 0,
  chatMessages: new Map(),
  audioSettings: {
    ...defaultAudioSettings,
    ...JSON.parse(localStorage.getItem('CHADD-audio-settings') || '{}'),
  },
  isMuted: false,
  isDeafened: false,
  isSpeaking: false,
  wasManuallyMuted: false,
  micVolume: parseInt(localStorage.getItem('CHADD-mic-volume') || '50'),
  speakerVolume: parseInt(localStorage.getItem('CHADD-speaker-volume') || '50'),
  isPttPressed: false,
  showSettings: false,
  showServerSettings: false,
  serverConfig: {
    name: "CHADD Server",
    description: "A Discord-like voice chat server",
    motd: "Welcome to CHADD!",
    maxUsers: 50,
    requirePassword: false,
    password: "",
    port: 27890,
  },

  // Connection actions
  setSocket: (socket) => {
    const currentSocket = get().socket;
    if (currentSocket) {
      currentSocket.removeAllListeners();
    }
    
    if (socket) {
      // Set up socket event listeners
      socket.on('room-list', (rooms: Room[]) => {
        console.log('🏠 Received room list from server:', rooms.length, 'rooms');
        console.log('📋 Room names:', rooms.map(r => r.name));
        
        // Ensure userCount is set from users array if not provided
        const roomsWithUserCount = rooms.map(room => ({
          ...room,
          userCount: room.userCount ?? room.users?.length ?? 0
        }));
        
        get().setAvailableRooms(roomsWithUserCount);
        console.log('✅ Updated availableRooms in store with', roomsWithUserCount.length, 'rooms');
        
        // Always request fresh user data for all rooms
        rooms.forEach(room => {
          socket.emit('get-room-users', { roomId: room.id });
        });
      });
      
      socket.on('room-joined', (data: { room: Room, user: User }) => {
        console.log('Joined room:', data);
        get().setCurrentRoom(data.room);
        get().setCurrentUser(data.user);
        
        // Load chat history for the room
        console.log('About to load chat history for room:', data.room.id);
        get().loadChatHistory(data.room.id);
        
        // Start voice activity detection
        get().startVoiceActivityDetection();
      });
      
      socket.on('room-left', () => {
        console.log('Left room');
        
        // Clean up all voice connections and audio streams
        const { voiceConnections, audioStreams } = get();
        
        // Close all WebRTC connections
        voiceConnections.forEach((_, userId) => {
          get().removeVoiceConnection(userId);
        });
        
        // Remove all audio streams
        audioStreams.forEach((_, userId) => {
          get().removeAudioStream(userId);
        });
        
        get().setCurrentRoom(null);
        
        // Stop voice activity detection
        get().stopVoiceActivityDetection();
        
        console.log('Cleaned up all voice connections and streams on room leave');
      });
      
      socket.on('user-joined', (data: { roomId: string, user: User }) => {
        console.log('User joined:', data);
        const { currentRoom, roomUsers, availableRooms } = get();
        
        // Update current room if user joined our room
        if (currentRoom && currentRoom.id === data.roomId) {
          const updatedUsers = [...(currentRoom.users || [])];
          // Only add if not already in the list
          if (!updatedUsers.find(u => u.id === data.user.id)) {
            updatedUsers.push(data.user);
          }
          
          const updatedRoom = {
            ...currentRoom,
            users: updatedUsers
          };
          get().setCurrentRoom(updatedRoom);
          
          console.log(`Updated current room user list: ${updatedUsers.length} users`);
          
          // Initiate WebRTC connection with the new user if we have a local stream
          if (get().localStream && get().currentUser?.id !== data.user.id) {
            console.log('New user joined our room, initiating WebRTC connection:', data.user.username);
            console.log('Local stream state before WebRTC connection:', {
              hasLocalStream: !!get().localStream,
              trackCount: get().localStream?.getTracks().length,
              audioTracks: get().localStream?.getAudioTracks().length,
              vadRunning: !!get().vadInterval,
              audioContextState: get().audioContext?.state
            });
            
            // Small delay to ensure local audio setup is stable
            setTimeout(() => {
              get().initiateWebRTCConnection(data.user.id);
              
              // Check state after WebRTC connection
              setTimeout(() => {
                console.log('Local stream state after WebRTC connection:', {
                  hasLocalStream: !!get().localStream,
                  trackCount: get().localStream?.getTracks().length,
                  audioTracks: get().localStream?.getAudioTracks().length,
                  vadRunning: !!get().vadInterval,
                  audioContextState: get().audioContext?.state
                });
              }, 200);
            }, 100);
          }
        }
        
        // Update roomUsers map
        const newRoomUsers = new Map(roomUsers);
        const existingUsers = newRoomUsers.get(data.roomId) || [];
        if (!existingUsers.find(u => u.id === data.user.id)) {
          const updatedUsers = [...existingUsers, data.user];
          newRoomUsers.set(data.roomId, updatedUsers);
          set({ roomUsers: newRoomUsers });
          
          // Update availableRooms with new user count
          const updatedAvailableRooms = availableRooms.map(room => 
            room.id === data.roomId 
              ? { ...room, userCount: updatedUsers.length }
              : room
          );
          get().setAvailableRooms(updatedAvailableRooms);
        }
      });
      
      socket.on('user-left', (data: { roomId: string, userId: string }) => {
        console.log('User left:', data);
        const { currentRoom, roomUsers, availableRooms } = get();
        
        // Update current room if user left our room
        if (currentRoom && currentRoom.id === data.roomId) {
          const updatedUsers = (currentRoom.users || []).filter(u => u.id !== data.userId);
          const updatedRoom = {
            ...currentRoom,
            users: updatedUsers
          };
          get().setCurrentRoom(updatedRoom);
          console.log(`Updated current room user list after user left: ${updatedUsers.length} users`);
        }
        
        // Update roomUsers map
        const newRoomUsers = new Map(roomUsers);
        const existingUsers = newRoomUsers.get(data.roomId) || [];
        const filteredUsers = existingUsers.filter(user => user.id !== data.userId);
        newRoomUsers.set(data.roomId, filteredUsers);
        set({ roomUsers: newRoomUsers });
        
        // Update availableRooms with new user count
        const updatedAvailableRooms = availableRooms.map(room => 
          room.id === data.roomId 
            ? { ...room, userCount: filteredUsers.length }
            : room
        );
        get().setAvailableRooms(updatedAvailableRooms);
        
        // Clean up audio streams and connections for the user who left
        get().removeAudioStream(data.userId);
        get().removeVoiceConnection(data.userId);
        
        // Remove from speaking users if they leave
        get().setSpeakingUser(data.userId, false);
        
        console.log(`Cleaned up audio streams and connections for user: ${data.userId}`);
      });
      
      socket.on('room-created', (room: Room) => {
        console.log('Room created:', room);
        const { availableRooms } = get();
        get().setAvailableRooms([...availableRooms, room]);
      });

      socket.on('room-user-count-changed', (data: { roomId: string, userCount: number, action: 'joined' | 'left', user: { id: string, username: string } }) => {
        console.log('Room user count changed:', data);
        const { availableRooms } = get();
        
        // Update the user count in availableRooms
        const updatedAvailableRooms = availableRooms.map(room => 
          room.id === data.roomId 
            ? { ...room, userCount: data.userCount }
            : room
        );
        get().setAvailableRooms(updatedAvailableRooms);
      });
      
      socket.on('speaking-state-changed', (data: { userId: string, speaking: boolean }) => {
        get().setSpeakingUser(data.userId, data.speaking);
      });

      socket.on('room-users', (data: { roomId: string, users: User[] }) => {
        const { roomUsers, availableRooms } = get();
        const newRoomUsers = new Map(roomUsers);
        newRoomUsers.set(data.roomId, data.users);
        set({ roomUsers: newRoomUsers });
        
        // Update availableRooms with correct user count
        const updatedAvailableRooms = availableRooms.map(room => 
          room.id === data.roomId 
            ? { ...room, userCount: data.users.length }
            : room
        );
        get().setAvailableRooms(updatedAvailableRooms);
      });
      
      socket.on('user-mute-changed', (data: { userId: string, isMuted: boolean }) => {
        const { currentRoom, roomUsers } = get();
        
        // Update current room if user is in it
        if (currentRoom) {
          const updatedUsers = currentRoom.users?.map(user => 
            user.id === data.userId ? { ...user, isMuted: data.isMuted } : user
          ) || [];
          get().setCurrentRoom({ ...currentRoom, users: updatedUsers });
        }
        
        // Update roomUsers map for all rooms
        const newRoomUsers = new Map(roomUsers);
        for (const [roomId, users] of newRoomUsers.entries()) {
          const updatedUsers = users.map(user => 
            user.id === data.userId ? { ...user, isMuted: data.isMuted } : user
          );
          newRoomUsers.set(roomId, updatedUsers);
        }
        set({ roomUsers: newRoomUsers });
      });
      
      socket.on('user-deafen-changed', (data: { userId: string, isDeafened: boolean }) => {
        const { currentRoom, roomUsers } = get();
        
        // Update current room if user is in it
        if (currentRoom) {
          const updatedUsers = currentRoom.users?.map(user => 
            user.id === data.userId ? { ...user, isDeafened: data.isDeafened } : user
          ) || [];
          get().setCurrentRoom({ ...currentRoom, users: updatedUsers });
        }
        
        // Update roomUsers map for all rooms
        const newRoomUsers = new Map(roomUsers);
        for (const [roomId, users] of newRoomUsers.entries()) {
          const updatedUsers = users.map(user => 
            user.id === data.userId ? { ...user, isDeafened: data.isDeafened } : user
          );
          newRoomUsers.set(roomId, updatedUsers);
        }
        set({ roomUsers: newRoomUsers });
      });
      
      socket.on('chat-message', (message: any) => {
        console.log('Chat message received:', message);
        get().addChatMessage(message.roomId, message);
      });

      socket.on('global-chat-message', (message: any) => {
        console.log('Global chat message received:', message);
        get().addChatMessage('global', message);
      });

      // WebRTC signaling events
      socket.on('offer', async (data: { fromUserId: string, offer: RTCSessionDescriptionInit, audioConfig?: any }) => {
        console.log('Received offer from:', data.fromUserId);
        await get().handleOffer(data.fromUserId, data.offer, data.audioConfig);
      });

      socket.on('answer', async (data: { fromUserId: string, answer: RTCSessionDescriptionInit }) => {
        console.log('Received answer from:', data.fromUserId);
        await get().handleAnswer(data.fromUserId, data.answer);
      });

      socket.on('ice-candidate', async (data: { fromUserId: string, candidate: RTCIceCandidateInit }) => {
        console.log('Received ICE candidate from:', data.fromUserId);
        await get().handleIceCandidate(data.fromUserId, data.candidate);
      });
      
      // Request initial room list
      socket.emit('get-rooms');
    }
    
    set({ socket });
  },

  setIsConnected: (connected) => {
    set({ 
      isConnected: connected,
      connectionStatus: connected ? 'connected' : 'disconnected'
    });
    
    // When connected, always request fresh room list from server
    if (connected) {
      const { socket } = get();
      if (socket) {
        console.log('🔄 Connected - requesting fresh room list from server');
        socket.emit('get-rooms');
        
        // Also load global chat history
        console.log('🌍 Loading global chat history');
        get().loadChatHistory('global');
      }
    }
  },

  setConnectionStatus: (status) => {
    set({ 
      connectionStatus: status,
      isConnected: status === 'connected'
    });
  },

  setServerInfo: (info) => {
    set({ serverInfo: info });
  },

  setServerConnection: (host, port) => {
    set({ serverHost: host, serverPort: port });
  },

  disconnect: () => {
    const { socket, localStream, voiceConnections, audioStreams } = get();
    
    // Stop voice activity detection
    get().stopVoiceActivityDetection();
    get().stopVisualVoiceActivityDetection();
    
    // Clean up all voice connections and audio streams properly
    voiceConnections.forEach((_, userId) => {
      get().removeVoiceConnection(userId);
    });
    
    audioStreams.forEach((_, userId) => {
      get().removeAudioStream(userId);
    });
    
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    // Disconnect socket
    if (socket) {
      socket.disconnect();
    }
    
    set({
      socket: null,
      isConnected: false,
      connectionStatus: 'disconnected',
      serverHost: '',
      serverPort: 0,
      serverInfo: null,
      currentUser: null,
      currentRoom: null,
      rooms: [],
      availableRooms: [],
      roomUsers: new Map(),
      chatMessages: new Map(), // Clear chat messages to force reload from server
      voiceConnections: new Map(),
      localStream: null,
      audioStreams: new Map(),
      speakingUsers: new Set(),
      audioContext: null,
      analyserNode: null,
      gainNode: null,
      vadInterval: null,
      isMuted: false,
      isDeafened: false,
      isSpeaking: false,
      wasManuallyMuted: false,
    });
    
    console.log('Disconnected and cleaned up all resources');
  },

  // User actions
  setCurrentUser: (user) => {
    set({ currentUser: user });
  },

  setUsername: (username) => {
    localStorage.setItem('CHADD-username', username);
    set({ username });
  },

  // Room actions
  setCurrentRoom: (room) => {
    set({ currentRoom: room });
  },

  setRooms: (rooms) => {
    set({ rooms });
  },

  setAvailableRooms: (rooms) => {
    set({ availableRooms: rooms });
  },

  updateRoom: (roomId, updates) => {
    const { rooms, availableRooms, currentRoom } = get();
    
    const updatedRooms = rooms.map(room => 
      room.id === roomId ? { ...room, ...updates } : room
    );
    
    const updatedAvailableRooms = availableRooms.map(room => 
      room.id === roomId ? { ...room, ...updates } : room
    );
    
    const updatedCurrentRoom = currentRoom && currentRoom.id === roomId 
      ? { ...currentRoom, ...updates } 
      : currentRoom;
    
    set({ 
      rooms: updatedRooms, 
      availableRooms: updatedAvailableRooms,
      currentRoom: updatedCurrentRoom 
    });
  },

  addRoom: (room) => {
    const { availableRooms } = get();
    set({ availableRooms: [...availableRooms, room] });
  },

  removeRoom: (roomId) => {
    const { rooms, availableRooms } = get();
    set({ 
      rooms: rooms.filter(room => room.id !== roomId),
      availableRooms: availableRooms.filter(room => room.id !== roomId)
    });
  },

  joinRoom: (roomId, username) => {
    const { socket, username: currentUsername } = get();
    const nameToUse = username || currentUsername;
    
    if (!socket || !nameToUse) {
      console.error('Cannot join room: no socket or username');
      return;
    }
    
    console.log('Joining room:', roomId, 'as', nameToUse);
    socket.emit('join-room', { roomId, username: nameToUse }, (response: any) => {
      console.log('Join room response:', response);
      if (response?.success) {
        console.log('Successfully joined room:', response.room);
        console.log('User data:', response.user);
        
        // Update the store with the new room and user data
        get().setCurrentRoom(response.room);
        get().setCurrentUser(response.user);
        
        // Load chat history for the room immediately
        console.log('Loading chat history after joining room:', response.room.id);
        get().loadChatHistory(response.room.id);
        
        // Request microphone access and start voice activity detection
        get().requestMicrophoneAccess().then(() => {
          // Initiate WebRTC connections with existing users in the room
          const existingUsers = response.room.users || [];
          existingUsers.forEach((user: User) => {
            if (user.id !== response.user.id) {
              console.log('Initiating WebRTC connection to existing user:', user.username);
              get().initiateWebRTCConnection(user.id);
            }
          });
        });
        
        console.log('Updated currentRoom and currentUser in store');
      } else {
        console.error('Failed to join room:', response?.error);
      }
    });
  },

  leaveRoom: () => {
    const { socket, currentRoom } = get();
    if (!socket || !currentRoom) {
      console.error('Cannot leave room: no socket or current room');
      return;
    }
    
    console.log('Leaving room:', currentRoom.id);
    socket.emit('leave-room');
    
    // Immediately clear the current room state
    get().setCurrentRoom(null);
    console.log('Cleared current room from store');
  },

  refreshRooms: () => {
    const { socket } = get();
    if (socket) {
      console.log('🔄 Manually refreshing room list from server');
      socket.emit('get-rooms');
    } else {
      console.error('Cannot refresh rooms: no socket connection');
    }
  },

  getRoomUsers: (roomId) => {
    const { socket } = get();
    if (!socket) return;
    
    socket.emit('get-room-users', { roomId });
  },

  // Voice actions
  setVoiceConnection: (userId, connection) => {
    const { voiceConnections } = get();
    const newConnections = new Map(voiceConnections);
    newConnections.set(userId, connection);
    set({ voiceConnections: newConnections });
  },

  removeVoiceConnection: (userId) => {
    const { voiceConnections } = get();
    const connection = voiceConnections.get(userId);
    
          // Properly close the WebRTC connection
      if (connection) {
        if (connection.peerConnection) {
          // Stop all tracks from the peer connection
          connection.peerConnection.getSenders().forEach(sender => {
            if (sender.track) {
              sender.track.stop();
              console.log(`Stopped WebRTC track for user: ${userId}`);
            }
          });
          
          connection.peerConnection.close();
          console.log(`Closed WebRTC connection for user: ${userId}`);
        }
        
        // Remove audio element if it exists
        if (connection.audioElement) {
          connection.audioElement.remove();
          console.log(`Removed audio element for user: ${userId}`);
        }
        
        // Clean up remote stream
        if (connection.remoteStream) {
          connection.remoteStream.getTracks().forEach(track => track.stop());
          console.log(`Stopped remote stream tracks for user: ${userId}`);
        }
        
        // Clean up WebRTC transmission stream
        if (connection.webrtcStream) {
          connection.webrtcStream.getTracks().forEach(track => track.stop());
          console.log(`Stopped WebRTC transmission stream for user: ${userId}`);
        }
      }
    
    const newConnections = new Map(voiceConnections);
    newConnections.delete(userId);
    set({ voiceConnections: newConnections });
    
    console.log(`Completely cleaned up voice connection for user: ${userId}`);
  },

  setLocalStream: (stream) => {
    const { localStream: oldStream } = get();
    
    // Stop old stream if it exists
    if (oldStream) {
      oldStream.getTracks().forEach(track => track.stop());
    }
    
    set({ localStream: stream });
    
    // Don't update WebRTC connections here - let them handle their own streams
    if (stream) {
      // Always start visual VAD for input level display
      get().startVisualVoiceActivityDetection();
      
      // Start voice activity detection if we're in a room
      if (get().currentRoom) {
        get().startVoiceActivityDetection();
      }
    }
  },

  setupAudioProcessing: (_stream) => {
    // Audio processing is handled within VAD setup to avoid breaking WebRTC
    console.log('Audio processing will be handled by VAD system');
  },

  addAudioStream: (userId, stream) => {
    const { audioStreams, isDeafened, voiceConnections, speakerVolume } = get();
    
    // Create audio element for playback
    const audioElement = document.createElement('audio');
    audioElement.srcObject = stream;
    audioElement.autoplay = true;
    audioElement.volume = speakerVolume / 100;
    audioElement.id = `audio-${userId}`;
    
    // Hide the audio element but keep it in DOM for playback
    audioElement.style.display = 'none';
    document.body.appendChild(audioElement);
    
    // Update voice connection with audio element
    const connection = voiceConnections.get(userId);
    if (connection) {
      // Remove old audio element if it exists
      if (connection.audioElement) {
        connection.audioElement.remove();
      }
      
      connection.audioElement = audioElement;
      get().setVoiceConnection(userId, connection);
         } else {
       // Create new voice connection with audio element
       const peerConnection = new RTCPeerConnection({
         iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
       });
       
       get().setVoiceConnection(userId, {
         userId,
         peerConnection,
         isConnected: true,
         connectionState: 'connected',
         isSpeaking: false,
         audioElement
       });
     }
    
    // If currently deafened, mute the new incoming audio
    if (isDeafened) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = false;
      });
      audioElement.muted = true;
      console.log(`Auto-muted new incoming audio from user: ${userId} (currently deafened)`);
    }
    
    const newStreams = new Map(audioStreams);
    newStreams.set(userId, stream);
    set({ audioStreams: newStreams });
    
    console.log(`Created audio element for user: ${userId}`);
  },

  removeAudioStream: (userId) => {
    const { audioStreams, voiceConnections } = get();
    
    // Get the stream to stop its tracks
    const stream = audioStreams.get(userId);
    if (stream) {
      // Stop all tracks in the stream
      stream.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped track for user: ${userId}`);
      });
    }
    
    // Clean up audio element
    const connection = voiceConnections.get(userId);
    if (connection?.audioElement) {
      connection.audioElement.pause();
      connection.audioElement.srcObject = null;
      connection.audioElement.remove();
      console.log(`Removed and cleaned up audio element for user: ${userId}`);
    }
    
    const newStreams = new Map(audioStreams);
    newStreams.delete(userId);
    set({ audioStreams: newStreams });
  },

  setSpeakingUser: (userId, speaking) => {
    const { speakingUsers } = get();
    const newSpeakingUsers = new Set(speakingUsers);
    if (speaking) {
      newSpeakingUsers.add(userId);
    } else {
      newSpeakingUsers.delete(userId);
    }
    set({ speakingUsers: newSpeakingUsers });
  },

  startVoiceActivityDetection: () => {
    const { localStream, currentUser, socket, audioSettings } = get();
    
    // Stop existing detection
    get().stopVoiceActivityDetection();
    
    if (!localStream || !currentUser) {
      console.log('Cannot start VAD: missing localStream or currentUser');
      return;
    }

    // Set up appropriate behavior for each voice mode
    if (audioSettings.voiceMode === 'always' || audioSettings.voiceMode === 'raw') {
      // Always transmitting modes - enable audio transmission
      if (localStream) {
        localStream.getAudioTracks().forEach(track => {
          track.enabled = !get().isMuted; // Enable transmission unless muted
        });
      }
      get().setSpeaking(true);
      get().setSpeakingUser(currentUser.id, true);
      if (socket) {
        socket.emit('speaking-changed', { 
          userId: currentUser.id,
          speaking: true 
        });
      }
      return;
    } else if (audioSettings.voiceMode === 'ptt') {
      // PTT mode - need to monitor PTT state continuously
      console.log('Setting up PTT mode monitoring...');
      
      // Set up PTT monitoring interval
      const interval = setInterval(() => {
        const currentIsPttPressed = get().isPttPressed;
        const currentIsMuted = get().isMuted;
        const currentUser = get().currentUser;
        const socket = get().socket;
        const localStream = get().localStream;
        
        const shouldShowSpeaking = currentIsPttPressed; // Always show when PTT pressed
        const shouldTransmit = currentIsPttPressed && !currentIsMuted; // Only transmit when not muted
        
        // Control audio transmission
        if (localStream) {
          localStream.getAudioTracks().forEach(track => {
            track.enabled = shouldTransmit;
          });
        }
        
        // Update speaking state
        const currentSpeaking = get().isSpeaking;
        if (shouldShowSpeaking !== currentSpeaking && currentUser) {
          get().setSpeaking(shouldShowSpeaking);
          get().setSpeakingUser(currentUser.id, shouldShowSpeaking);
          
          if (socket) {
            socket.emit('speaking-changed', { 
              userId: currentUser.id,
              speaking: shouldShowSpeaking 
            });
          }
        }
      }, 50); // Check every 50ms for responsive PTT
      
      set({ vadInterval: interval });
      console.log('PTT monitoring started');
      return;
    }
    
    // Only run VAD for VAD mode, and only if enabled
    if (audioSettings.voiceMode !== 'vad' || !audioSettings.vadEnabled) {
      console.log('Voice Activity Detection disabled');
      // In VAD mode but disabled, don't transmit
      if (localStream) {
        localStream.getAudioTracks().forEach(track => {
          track.enabled = false;
        });
      }
      get().setSpeaking(false);
      get().setSpeakingUser(currentUser.id, false);
      return;
    }
    
    try {
      // Create audio context and analyser for VAD with gain control
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Ensure audio context is running
      if (context.state === 'suspended') {
        context.resume().then(() => {
          console.log('Audio context resumed');
        }).catch((error) => {
          console.error('Failed to resume audio context:', error);
        });
      }
      
      // Add user interaction listener to resume audio context
      const resumeOnInteraction = () => {
        if (context.state === 'suspended') {
          context.resume().then(() => {
            console.log('Audio context resumed on user interaction');
          });
        }
      };
      
      // Listen for various user interactions
      document.addEventListener('click', resumeOnInteraction, { once: true });
      document.addEventListener('keydown', resumeOnInteraction, { once: true });
      document.addEventListener('touchstart', resumeOnInteraction, { once: true });
      
      const analyser = context.createAnalyser();
      const gainNode = context.createGain();
      
      // Use the original stream for VAD
      const originalTrack = localStream.getAudioTracks()[0];
      if (!originalTrack) {
        console.error('No audio track found for VAD');
        return;
      }
      
      // Create source and connect through gain node for volume control
      const source = context.createMediaStreamSource(localStream);
      
      // Better settings for more reliable detection
      analyser.fftSize = 512; // Increased for better frequency resolution
      analyser.smoothingTimeConstant = audioSettings.vadSmoothingTimeConstant;
      analyser.minDecibels = -90; // Lower minimum for better sensitivity
      analyser.maxDecibels = -10; // Higher maximum for better range
      
      // Connect: source -> gainNode -> analyser (for VAD analysis with volume control)
      source.connect(gainNode);
      gainNode.connect(analyser);
      
      // Set initial gain based on input volume
      gainNode.gain.value = audioSettings.inputVolume / 100;
      console.log(`VAD setup with input volume: ${audioSettings.inputVolume}%`);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const floatDataArray = new Float32Array(analyser.frequencyBinCount);
      let isSpeaking = false;
      let lastSpeakingChange = 0;
      
      const checkVoiceActivity = () => {
        const now = Date.now();
        const currentAudioSettings = get().audioSettings;
        const currentIsMuted = get().isMuted;
        const currentIsPttPressed = get().isPttPressed;
        
        // Check if audio context is still running
        if (context.state === 'suspended') {
          console.log('Audio context suspended, attempting to resume...');
          context.resume().catch(error => {
            console.error('Failed to resume audio context:', error);
          });
          return; // Skip this iteration
        }
        
        // Check if we still have a valid stream
        const currentStream = get().localStream;
        if (!currentStream || currentStream.getAudioTracks().length === 0) {
          console.log('No valid audio stream, stopping VAD');
          get().stopVoiceActivityDetection();
          return;
        }
        
        // Check if the audio track is still active
        const audioTrack = currentStream.getAudioTracks()[0];
        if (!audioTrack || audioTrack.readyState !== 'live') {
          console.log('Audio track not live, stopping VAD');
          get().stopVoiceActivityDetection();
          return;
        }
        
        // Use time domain data for more direct audio level detection
        const timeDomainData = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(timeDomainData);
        
        // Also get frequency data for comparison
        analyser.getByteFrequencyData(dataArray);
        analyser.getFloatFrequencyData(floatDataArray);
        
        // Calculate RMS from time domain data (more direct for voice detection)
        let timeDomainSum = 0;
        for (let i = 0; i < timeDomainData.length; i++) {
          const sample = (timeDomainData[i] - 128) / 128; // Convert to -1 to 1 range
          timeDomainSum += sample * sample;
        }
        const timeDomainRms = Math.sqrt(timeDomainSum / timeDomainData.length) * 100;
        
        // Calculate RMS using byte frequency data
        let byteSum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          byteSum += dataArray[i] * dataArray[i];
        }
        const byteRms = Math.sqrt(byteSum / dataArray.length);
        
        // Calculate RMS using float data (more accurate)
        let floatSum = 0;
        let validSamples = 0;
        for (let i = 0; i < floatDataArray.length; i++) {
          if (isFinite(floatDataArray[i]) && floatDataArray[i] > -Infinity) {
            const linear = Math.pow(10, floatDataArray[i] / 20); // Convert dB to linear
            floatSum += linear * linear;
            validSamples++;
          }
        }
        const floatRms = validSamples > 0 ? Math.sqrt(floatSum / validSamples) * 100 : 0;
        
        // Also calculate simple average for comparison
        let simpleSum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          simpleSum += dataArray[i];
        }
        const average = simpleSum / dataArray.length;
        
        // Use time domain RMS as primary, with frequency data as backup
        const audioLevel = Math.max(timeDomainRms, floatRms, byteRms);
        
        let shouldShowSpeaking = false;
        let shouldTransmit = false;
        
        // Handle different voice modes
        switch (currentAudioSettings.voiceMode) {
          case 'vad':
            // Voice Activity Detection mode - try multiple detection methods
            const timeDomainVadDetected = timeDomainRms > currentAudioSettings.vadThreshold;
            const floatVadDetected = floatRms > currentAudioSettings.vadThreshold;
            const byteVadDetected = byteRms > currentAudioSettings.vadThreshold;
            const averageVadDetected = average > currentAudioSettings.vadThreshold;
            const audioLevelDetected = audioLevel > currentAudioSettings.vadThreshold;
            
            // Use any method that detects voice, prioritize time domain
            const vadDetected = timeDomainVadDetected || audioLevelDetected || floatVadDetected || byteVadDetected || averageVadDetected;
            
            shouldShowSpeaking = vadDetected && !currentIsMuted;
            shouldTransmit = vadDetected && !currentIsMuted;
            
            // Enhanced debug for VAD detection
            if (now % 500 < 50) {
              console.log(`VAD Detection - TimeDomain: ${timeDomainVadDetected}, AudioLevel: ${audioLevelDetected}, Float: ${floatVadDetected}, Byte: ${byteVadDetected}, Average: ${averageVadDetected}, Final: ${vadDetected}`);
            }
            break;
            
          case 'ptt':
            // Push-to-Talk mode - show speaking when PTT pressed, transmit only when not muted
            shouldShowSpeaking = currentIsPttPressed; // Always show when PTT pressed
            shouldTransmit = currentIsPttPressed && !currentIsMuted; // Only transmit when not muted
            break;
            
          case 'always':
            // Always on mode - always show speaking unless muted
            shouldShowSpeaking = !currentIsMuted;
            shouldTransmit = !currentIsMuted;
            break;
            
          case 'raw':
            // Raw audio mode - always transmit unless muted, no speaking indication
            shouldShowSpeaking = !currentIsMuted;
            shouldTransmit = !currentIsMuted;
            break;
        }
        
        // Update input and output levels for UI display
        const inputLevel = Math.min(100, audioLevel); // Raw input level (0-100)
        const outputLevel = shouldTransmit ? inputLevel : 0; // Output level after threshold processing
        
        set({ 
          currentInputLevel: inputLevel,
          currentOutputLevel: outputLevel 
        });
        
        // Debug logging every few seconds
        if (now % 500 < 50) { // Log roughly every 0.5 seconds for more detailed debugging
          console.log(`VAD Debug - Mode: ${currentAudioSettings.voiceMode}, InputLevel: ${inputLevel.toFixed(1)}, OutputLevel: ${outputLevel.toFixed(1)}, TimeDomainRMS: ${timeDomainRms.toFixed(1)}, AudioLevel: ${audioLevel.toFixed(1)}, Threshold: ${currentAudioSettings.vadThreshold}, Muted: ${currentIsMuted}, PTT: ${currentIsPttPressed}, Speaking: ${isSpeaking}, ShouldTransmit: ${shouldTransmit}`);
        }
        
        // Debounce speaking state changes (only for VAD mode)
        const shouldDebounce = currentAudioSettings.voiceMode === 'vad';
        const canUpdate = !shouldDebounce || (now - lastSpeakingChange) > currentAudioSettings.vadDebounceTime;
        
        // Force update if we've been stuck in one state for too long (failsafe)
        const stuckTimeout = 10000; // 10 seconds
        const forceUpdate = (now - lastSpeakingChange) > stuckTimeout;
        
        if ((shouldShowSpeaking !== isSpeaking && canUpdate) || forceUpdate) {
          isSpeaking = shouldShowSpeaking;
          lastSpeakingChange = now;
          
          if (forceUpdate) {
            console.log('Force updating speaking state due to timeout');
          }
          
          // Local stream is always enabled for VAD analysis - never disable it
          if (localStream) {
            localStream.getAudioTracks().forEach(track => {
              track.enabled = true; // Always keep local stream enabled for analysis
            });
          }
          
          // Control WebRTC transmission streams based on shouldTransmit
          const { voiceConnections } = get();
          voiceConnections.forEach((connection) => {
            if (connection.peerConnection) {
              // Get the audio sender (separate WebRTC stream)
              const senders = connection.peerConnection.getSenders();
              const audioSender = senders.find(sender => 
                sender.track && sender.track.kind === 'audio'
              );
              
              if (audioSender && audioSender.track) {
                audioSender.track.enabled = shouldTransmit;
                console.log(`WebRTC transmission ${shouldTransmit ? 'enabled' : 'disabled'} for connection`);
              }
            }
          });
          
          // Update local speaking state and transmit
          get().setSpeaking(shouldShowSpeaking);
          get().setSpeakingUser(currentUser.id, shouldShowSpeaking);
          
          if (socket) {
            socket.emit('speaking-changed', { 
              userId: currentUser.id,
              speaking: shouldShowSpeaking 
            });
          }
        }
      };
      
      // Check voice activity at fixed 100ms intervals for better performance
      const interval = setInterval(checkVoiceActivity, 100);
      
      // Keep audio context alive by periodically checking and resuming
      const keepAliveInterval = setInterval(() => {
        if (context.state === 'suspended') {
          console.log('Keeping audio context alive...');
          context.resume().catch(error => {
            console.error('Failed to keep audio context alive:', error);
          });
        }
      }, 5000); // Check every 5 seconds
      
      set({ 
        audioContext: context, 
        analyserNode: analyser,
        gainNode: gainNode,
        vadInterval: interval 
      });
      
      // Store the keep-alive interval for cleanup
      (context as any).__keepAliveInterval = keepAliveInterval;
      
      console.log('Voice activity detection started');
    } catch (error) {
      console.error('Failed to start voice activity detection:', error);
    }
  },

  stopVoiceActivityDetection: () => {
    const { audioContext, vadInterval, currentUser } = get();
    
    if (vadInterval) {
      clearInterval(vadInterval);
    }
    
    if (audioContext) {
      // Clear keep-alive interval
      if ((audioContext as any).__keepAliveInterval) {
        clearInterval((audioContext as any).__keepAliveInterval);
      }
      
      if (audioContext.state !== 'closed') {
        audioContext.close();
      }
    }
    
    // Clear speaking state
    if (currentUser) {
      get().setSpeaking(false);
      get().setSpeakingUser(currentUser.id, false);
    }
    
    set({ 
      audioContext: null, 
      analyserNode: null,
      gainNode: null,
      vadInterval: null 
    });
    
    console.log('Voice activity detection stopped');
  },

  // Audio actions
  updateAudioSettings: (settings) => {
    const { audioSettings, currentRoom, gainNode, voiceConnections } = get();
    const newSettings = { ...audioSettings, ...settings };
    
    // Apply input volume changes to gain node immediately (no restart needed)
    if (settings.inputVolume !== undefined && gainNode) {
      gainNode.gain.value = settings.inputVolume / 100;
      console.log(`Input volume updated to: ${settings.inputVolume}% (live update)`);
    }
    
    // Apply output volume changes to all audio elements immediately (no restart needed)
    if (settings.outputVolume !== undefined) {
      const outputVolume = settings.outputVolume;
      voiceConnections.forEach((connection) => {
        if (connection.audioElement) {
          connection.audioElement.volume = outputVolume / 100;
        }
      });
      console.log(`Output volume updated to: ${outputVolume}% (live update)`);
    }
    
    // Save settings
    localStorage.setItem('CHADD-audio-settings', JSON.stringify(newSettings));
    set({ audioSettings: newSettings });
    
    // Check if we need to restart anything
    const deviceChanged = settings.inputDeviceId && settings.inputDeviceId !== audioSettings.inputDeviceId;
    
    // Only restart microphone for processing settings that actually require new getUserMedia
    const processingChanged = 
      ('echoCancellation' in settings && settings.echoCancellation !== audioSettings.echoCancellation) ||
      ('noiseSuppression' in settings && settings.noiseSuppression !== audioSettings.noiseSuppression) ||
      ('autoGainControl' in settings && settings.autoGainControl !== audioSettings.autoGainControl);
      
    // Voice mode changes only need VAD restart, not microphone restart
    const voiceModeChanged = 'voiceMode' in settings && settings.voiceMode !== audioSettings.voiceMode;
    
    // VAD threshold changes don't need any restart
    const onlyVadSettingsChanged = 
      ('vadThreshold' in settings || 'vadSmoothingTimeConstant' in settings || 'vadDebounceTime' in settings) &&
      !deviceChanged && !processingChanged && !voiceModeChanged;
    
    if (onlyVadSettingsChanged) {
      console.log('VAD settings updated (no restart needed)');
      return;
    }
    
    if (!currentRoom) {
      console.log('Audio settings updated (not in voice channel)');
      return;
    }
    
    if (deviceChanged) {
      console.log(`Input device changed: ${audioSettings.inputDeviceId} -> ${settings.inputDeviceId}`);
      // Device change requires full microphone restart
      get().stopVoiceActivityDetection();
      setTimeout(() => {
        get().requestMicrophoneAccess();
      }, 100);
    } else if (processingChanged) {
      console.log('Audio processing settings changed, restarting microphone...');
      // Processing settings require microphone restart
      setTimeout(() => {
        get().requestMicrophoneAccess();
      }, 200);
    } else if (voiceModeChanged) {
      console.log(`Voice mode changed: ${audioSettings.voiceMode} -> ${settings.voiceMode}`);
      // Voice mode only needs VAD restart
      setTimeout(() => {
        get().stopVoiceActivityDetection();
        get().startVoiceActivityDetection();
      }, 50);
    }
  },

  setMuted: (muted) => {
    const { socket, localStream, voiceConnections } = get();
    
    // Local stream always stays enabled for VAD analysis
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = true; // Always keep local stream enabled for analysis
      });
    }
    
    // Control WebRTC transmission streams based on mute state
    voiceConnections.forEach((connection) => {
      if (connection.peerConnection) {
        const senders = connection.peerConnection.getSenders();
        const audioSender = senders.find(sender => 
          sender.track && sender.track.kind === 'audio'
        );
        
        if (audioSender && audioSender.track) {
          // When muted, disable WebRTC transmission
          audioSender.track.enabled = !muted;
          console.log(`Mute ${muted ? 'enabled' : 'disabled'} - WebRTC transmission ${!muted ? 'enabled' : 'disabled'}`);
        }
      }
    });
    
    // Notify server
    if (socket) {
      socket.emit('mute-changed', { muted });
    }
    
    set({ isMuted: muted });
  },

  setDeafened: (deafened) => {
    const { socket, isMuted, audioStreams, voiceConnections } = get();
    
    if (deafened) {
      // Store current mute state before deafening
      set({ wasManuallyMuted: isMuted });
      // Deafening always mutes the microphone
      get().setMuted(true);
      
      // Mute all incoming audio (deafen = can't hear others)
      voiceConnections.forEach((connection, userId) => {
        if (connection.audioElement) {
          connection.audioElement.muted = true;
          console.log(`Deafened audio element for user: ${userId}`);
        }
      });
      
      // Also mute the streams as backup
      audioStreams.forEach((stream, _) => {
        stream.getAudioTracks().forEach(track => {
          track.enabled = false;
        });
      });
    } else {
      // Undeafening: restore previous mute state
      const { wasManuallyMuted } = get();
      get().setMuted(wasManuallyMuted);
      set({ wasManuallyMuted: false });
      
      // Unmute all incoming audio (undeafen = can hear others again)
      voiceConnections.forEach((connection, userId) => {
        if (connection.audioElement) {
          connection.audioElement.muted = false;
          console.log(`Undeafened audio element for user: ${userId}`);
        }
      });
      
      // Also unmute the streams
      audioStreams.forEach((stream, _) => {
        stream.getAudioTracks().forEach(track => {
          track.enabled = true;
        });
      });
    }
    
    // Notify server
    if (socket) {
      socket.emit('deafen-changed', { deafened });
    }
    
    set({ isDeafened: deafened });
  },

  setSpeaking: (speaking) => {
    // setSpeaking is now only for local visual state
    // Transmission is handled by VAD logic based on voice mode
    set({ isSpeaking: speaking });
  },

  setMicVolume: (volume) => {
    localStorage.setItem('CHADD-mic-volume', volume.toString());
    set({ micVolume: volume });
  },

  setSpeakerVolume: (volume) => {
    const { voiceConnections } = get();
    
    // Update volume for all audio elements
    voiceConnections.forEach((connection) => {
      if (connection.audioElement) {
        connection.audioElement.volume = volume / 100;
        console.log(`Updated audio element volume to: ${volume}%`);
      }
    });
    
    // Also update any audio elements by ID (backup method)
    const audioElements = document.querySelectorAll('audio[id^="audio-"]');
    audioElements.forEach((element) => {
      const audio = element as HTMLAudioElement;
      audio.volume = volume / 100;
    });
    
    localStorage.setItem('CHADD-speaker-volume', volume.toString());
    set({ speakerVolume: volume });
    
    console.log(`Speaker volume set to: ${volume}%`);
  },

  toggleMute: () => {
    const { isMuted } = get();
    get().setMuted(!isMuted);
  },

  toggleDeafen: () => {
    const { isDeafened } = get();
    get().setDeafened(!isDeafened);
  },

  // Chat actions
  sendChatMessage: (message) => {
    const { socket, currentRoom, currentUser } = get();
    if (!socket || !currentRoom || !currentUser) return;
    
    socket.emit('chat-message', {
      roomId: currentRoom.id,
      message
    });
  },

  sendGlobalChatMessage: (message) => {
    const { socket, currentUser } = get();
    if (!socket || !currentUser) return;
    
    socket.emit('global-chat-message', {
      message
    });
  },

  addChatMessage: (roomId, message) => {
    const { chatMessages } = get();
    const roomChatMessages = chatMessages.get(roomId) || [];
    const newChatMessages = new Map(chatMessages);
    newChatMessages.set(roomId, [...roomChatMessages, message]);
    set({ chatMessages: newChatMessages });
  },

  loadChatHistory: async (roomId) => {
    try {
      console.log(`Loading chat history for room: ${roomId}`);
      const { serverHost, serverPort } = get();
      
      if (!serverHost || !serverPort) {
        console.error('No server connection details available');
        return;
      }
      
      const response = await fetch(`http://${serverHost}:${serverPort}/api/messages/${roomId}?limit=50`);
      if (response.ok) {
        const data = await response.json();
        console.log(`Loaded ${data.messages.length} messages for room ${roomId}:`, data.messages);
        const { chatMessages } = get();
        const newChatMessages = new Map(chatMessages);
        newChatMessages.set(roomId, data.messages);
        set({ chatMessages: newChatMessages });
        console.log(`Chat history updated for room ${roomId}`);
      } else {
        console.error(`Failed to load chat history for room ${roomId}:`, response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  },

  // UI actions
  setShowSettings: (show) => {
    set({ showSettings: show });
  },

  setShowServerSettings: (show) => {
    set({ showServerSettings: show });
  },

  setServerConfig: (config) => {
    set({ serverConfig: config });
  },

  requestMicrophoneAccess: async () => {
    try {
      console.log('Requesting microphone access...');
      const { audioSettings, localStream } = get();
      
      // Stop existing stream first
      if (localStream) {
        console.log('Stopping existing audio stream...');
        localStream.getTracks().forEach(track => {
          track.stop();
          console.log('Stopped existing audio track');
        });
      }
      
      // Stop existing VAD to avoid conflicts
      get().stopVoiceActivityDetection();
      get().stopVisualVoiceActivityDetection();
      
      // Discord-like audio constraints for better quality
      const audioConstraints: MediaTrackConstraints = {
        echoCancellation: audioSettings.echoCancellation,
        noiseSuppression: audioSettings.noiseSuppression,
        autoGainControl: audioSettings.autoGainControl,
        sampleRate: 48000, // Discord uses 48kHz
        sampleSize: 16,
        channelCount: 1, // Mono for voice
        deviceId: audioSettings.inputDeviceId !== 'default' ? audioSettings.inputDeviceId : undefined
      };
      
      console.log(`Requesting microphone with device: ${audioSettings.inputDeviceId}`);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: audioConstraints
      });
      
      console.log('Got new microphone access, setting local stream');
      get().setLocalStream(stream);
      
      // Always start visual VAD for input level display
      get().startVisualVoiceActivityDetection();
      
      // Start voice activity detection if we're in a room
      if (get().currentRoom) {
        console.log('Starting VAD for new stream...');
        get().startVoiceActivityDetection();
      }
    } catch (error) {
      console.error('Failed to get microphone access:', error);
      alert('Microphone access denied. Voice chat will not work.');
    }
  },

  // WebRTC actions
  handleOffer: async (fromUserId, offer, _audioConfig) => {
    const { socket, localStream, voiceConnections } = get();
    if (!socket || !localStream) return;

    try {
      console.log('Creating peer connection for offer from:', fromUserId);
      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      // Create a separate stream for WebRTC transmission
      const webrtcStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: get().audioSettings.inputDeviceId !== 'default' ? get().audioSettings.inputDeviceId : undefined,
          echoCancellation: get().audioSettings.echoCancellation,
          noiseSuppression: get().audioSettings.noiseSuppression,
          autoGainControl: get().audioSettings.autoGainControl,
          sampleRate: 48000,
          sampleSize: 16,
          channelCount: 1
        }
      });
      
      webrtcStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, webrtcStream);
      });
      
      console.log('Created separate WebRTC stream for:', fromUserId);

      // Monitor connection state
      peerConnection.onconnectionstatechange = () => {
        console.log(`WebRTC connection state changed for ${fromUserId}:`, peerConnection.connectionState);
        
        const connection = get().voiceConnections.get(fromUserId);
        if (connection) {
          connection.connectionState = peerConnection.connectionState;
          connection.isConnected = peerConnection.connectionState === 'connected';
          get().setVoiceConnection(fromUserId, connection);
        }
        
        // Clean up failed connections
        if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'disconnected') {
          console.log(`Cleaning up failed connection for: ${fromUserId}`);
          get().removeVoiceConnection(fromUserId);
          get().removeAudioStream(fromUserId);
        }
      };

      // Handle incoming stream
      peerConnection.ontrack = (event) => {
        console.log('Received remote stream from:', fromUserId);
        const stream = event.streams[0];
        
        // Create audio element for playback
        const audioElement = document.createElement('audio');
        audioElement.srcObject = stream;
        audioElement.autoplay = true;
        audioElement.volume = get().speakerVolume / 100;
        
        // Add to DOM (hidden)
        audioElement.style.display = 'none';
        document.body.appendChild(audioElement);
        
        // Store both stream and audio element
        get().addAudioStream(fromUserId, stream);
        
        // Update the voice connection with the audio element
        const { voiceConnections } = get();
        const connection = voiceConnections.get(fromUserId);
        if (connection) {
          connection.audioElement = audioElement;
          connection.remoteStream = stream;
          get().setVoiceConnection(fromUserId, connection);
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', {
            targetUserId: fromUserId,
            candidate: event.candidate
          });
        }
      };

      // Set remote description and create answer
      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      // Send answer
      socket.emit('answer', {
        targetUserId: fromUserId,
        answer
      });

      // Store connection with WebRTC stream reference
      const newConnection = {
        userId: fromUserId,
        peerConnection,
        isConnected: false,
        connectionState: peerConnection.connectionState,
        isSpeaking: false,
        pendingIceCandidates: [],
        webrtcStream: webrtcStream // Store the separate WebRTC stream
      };
      
      get().setVoiceConnection(fromUserId, newConnection);
      
      // Process any queued ICE candidates that might have arrived before the offer
      const existingConnection = voiceConnections.get(fromUserId);
      if (existingConnection?.pendingIceCandidates && existingConnection.pendingIceCandidates.length > 0) {
        console.log(`Processing ${existingConnection.pendingIceCandidates.length} queued ICE candidates for:`, fromUserId);
        
        for (const candidate of existingConnection.pendingIceCandidates) {
          try {
            await peerConnection.addIceCandidate(candidate);
            console.log('Added queued ICE candidate for:', fromUserId);
          } catch (error) {
            console.error('Error adding queued ICE candidate:', error);
          }
        }
        
        // Clear the queue
        newConnection.pendingIceCandidates = [];
        get().setVoiceConnection(fromUserId, newConnection);
      }
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  },

  handleAnswer: async (fromUserId, answer) => {
    const { voiceConnections } = get();
    const connection = voiceConnections.get(fromUserId);
    
    if (connection?.peerConnection) {
      try {
        await connection.peerConnection.setRemoteDescription(answer);
        console.log('Set remote description from answer:', fromUserId);
        
        // Process any queued ICE candidates now that remote description is set
        if (connection.pendingIceCandidates && connection.pendingIceCandidates.length > 0) {
          console.log(`Processing ${connection.pendingIceCandidates.length} queued ICE candidates for:`, fromUserId);
          
          for (const candidate of connection.pendingIceCandidates) {
            try {
              await connection.peerConnection.addIceCandidate(candidate);
              console.log('Added queued ICE candidate for:', fromUserId);
            } catch (error) {
              console.error('Error adding queued ICE candidate:', error);
            }
          }
          
          // Clear the queue
          connection.pendingIceCandidates = [];
          get().setVoiceConnection(fromUserId, connection);
        }
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    }
  },

  handleIceCandidate: async (fromUserId, candidate) => {
    const { voiceConnections } = get();
    const connection = voiceConnections.get(fromUserId);
    
    if (!connection?.peerConnection) {
      console.log('No peer connection found for ICE candidate from:', fromUserId);
      return;
    }

    try {
      // Check if remote description is set
      if (connection.peerConnection.remoteDescription) {
        // Remote description is set, we can add the ICE candidate immediately
        await connection.peerConnection.addIceCandidate(candidate);
        console.log('Added ICE candidate from:', fromUserId);
      } else {
        // Remote description not set yet, queue the ICE candidate
        console.log('Queueing ICE candidate from:', fromUserId, '- remote description not set yet');
        
        if (!connection.pendingIceCandidates) {
          connection.pendingIceCandidates = [];
        }
        connection.pendingIceCandidates.push(candidate);
        
        // Update the connection in the store
        get().setVoiceConnection(fromUserId, connection);
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  },

  initiateWebRTCConnection: async (targetUserId) => {
    const { socket, localStream, voiceConnections } = get();
    if (!socket || !localStream) return;

    // Check if connection already exists
    const existingConnection = voiceConnections.get(targetUserId);
    if (existingConnection?.peerConnection?.connectionState === 'connected') {
      console.log('WebRTC connection already exists for:', targetUserId);
      return;
    }

    try {
      console.log('Initiating WebRTC connection to:', targetUserId);
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ],
        iceCandidatePoolSize: 10 // Better for multiple connections
      });

      // Create a separate stream for WebRTC transmission
      const webrtcStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: get().audioSettings.inputDeviceId !== 'default' ? get().audioSettings.inputDeviceId : undefined,
          echoCancellation: get().audioSettings.echoCancellation,
          noiseSuppression: get().audioSettings.noiseSuppression,
          autoGainControl: get().audioSettings.autoGainControl,
          sampleRate: 48000,
          sampleSize: 16,
          channelCount: 1
        }
      });
      
      webrtcStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, webrtcStream);
      });
      
      console.log('Created separate WebRTC stream for:', targetUserId);

      // Monitor connection state
      peerConnection.onconnectionstatechange = () => {
        console.log(`WebRTC connection state changed for ${targetUserId}:`, peerConnection.connectionState);
        
        const connection = get().voiceConnections.get(targetUserId);
        if (connection) {
          connection.connectionState = peerConnection.connectionState;
          connection.isConnected = peerConnection.connectionState === 'connected';
          get().setVoiceConnection(targetUserId, connection);
        }
        
        // Clean up failed connections
        if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'disconnected') {
          console.log(`Cleaning up failed connection for: ${targetUserId}`);
          get().removeVoiceConnection(targetUserId);
          get().removeAudioStream(targetUserId);
        }
      };

      // Handle incoming stream
      peerConnection.ontrack = (event) => {
        console.log('Received remote stream from:', targetUserId);
        const stream = event.streams[0];
        
        // Create audio element for playback
        const audioElement = document.createElement('audio');
        audioElement.srcObject = stream;
        audioElement.autoplay = true;
        audioElement.volume = get().speakerVolume / 100;
        
        // Add to DOM (hidden)
        audioElement.style.display = 'none';
        document.body.appendChild(audioElement);
        
        // Store both stream and audio element
        get().addAudioStream(targetUserId, stream);
        
        // Update the voice connection with the audio element
        const { voiceConnections } = get();
        const connection = voiceConnections.get(targetUserId);
        if (connection) {
          connection.audioElement = audioElement;
          connection.remoteStream = stream;
          get().setVoiceConnection(targetUserId, connection);
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', {
            targetUserId,
            candidate: event.candidate
          });
        }
      };

      // Create and send offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      socket.emit('offer', {
        targetUserId,
        offer
      });

      // Store connection with WebRTC stream reference
      get().setVoiceConnection(targetUserId, {
        userId: targetUserId,
        peerConnection,
        isConnected: false,
        connectionState: peerConnection.connectionState,
        isSpeaking: false,
        pendingIceCandidates: [],
        webrtcStream: webrtcStream // Store the separate WebRTC stream
      });
    } catch (error) {
      console.error('Error initiating WebRTC connection:', error);
    }
  },

  // Push-to-talk actions
  setPttPressed: (pressed) => {
    const { isPttPressed } = get();
    
    if (isPttPressed === pressed) return; // No change
    
    set({ isPttPressed: pressed });
    
    console.log(`PTT ${pressed ? 'pressed' : 'released'}`);
    
    // Note: Audio transmission and speaking state are now handled by the VAD system
    // which checks the isPttPressed state for PTT mode
  },

  initializePttListeners: () => {
    const { audioSettings } = get();
    
    if (audioSettings.voiceMode !== 'ptt') return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === audioSettings.pttKey && !event.repeat) {
        event.preventDefault();
        get().setPttPressed(true);
      }
    };
    
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === audioSettings.pttKey) {
        event.preventDefault();
        get().setPttPressed(false);
      }
    };
    
    // Remove existing listeners
    get().removePttListeners();
    
    // Add new listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Store listeners for cleanup
    (window as any).__pttKeyDown = handleKeyDown;
    (window as any).__pttKeyUp = handleKeyUp;
    
    console.log(`PTT listeners initialized for key: ${audioSettings.pttKey}`);
  },

  removePttListeners: () => {
    if ((window as any).__pttKeyDown) {
      window.removeEventListener('keydown', (window as any).__pttKeyDown);
      delete (window as any).__pttKeyDown;
    }
    
    if ((window as any).__pttKeyUp) {
      window.removeEventListener('keyup', (window as any).__pttKeyUp);
      delete (window as any).__pttKeyUp;
    }
  },

  // Visual Voice Activity Detection (always runs for input level display)
  startVisualVoiceActivityDetection: () => {
    const { localStream } = get();
    
    // Stop existing visual VAD
    get().stopVisualVoiceActivityDetection();
    
    if (!localStream) {
      console.log('Cannot start visual VAD: missing localStream');
      return;
    }

    try {
      console.log('Starting visual voice activity detection...');
      
      // Create separate audio context for visual monitoring
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Ensure audio context is running
      if (context.state === 'suspended') {
        context.resume().then(() => {
          console.log('Visual audio context resumed');
        }).catch((error) => {
          console.error('Failed to resume visual audio context:', error);
        });
      }
      
      const analyser = context.createAnalyser();
      const source = context.createMediaStreamSource(localStream);
      
      // Settings for visual monitoring
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.3; // Faster response for visual feedback
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      
      source.connect(analyser);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const checkVisualActivity = () => {
        analyser.getByteFrequencyData(dataArray);
        
        // Calculate RMS for input level display
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / dataArray.length);
        
        // Convert to 0-100 scale for UI
        const inputLevel = Math.min(100, (rms / 50) * 100);
        
        set({ currentInputLevel: inputLevel });
      };
      
      // Update visual feedback at 60fps for smooth bars
      const interval = setInterval(checkVisualActivity, 16);
      
      set({ 
        visualAudioContext: context, 
        visualAnalyserNode: analyser,
        visualVadInterval: interval 
      });
      
      console.log('Visual voice activity detection started');
    } catch (error) {
      console.error('Failed to start visual voice activity detection:', error);
    }
  },

  stopVisualVoiceActivityDetection: () => {
    const { visualAudioContext, visualVadInterval } = get();
    
    if (visualVadInterval) {
      clearInterval(visualVadInterval);
    }
    
    if (visualAudioContext && visualAudioContext.state !== 'closed') {
      visualAudioContext.close();
    }
    
    set({ 
      visualAudioContext: null, 
      visualAnalyserNode: null,
      visualVadInterval: null,
      currentInputLevel: 0,
      currentOutputLevel: 0
    });
    
    console.log('Visual voice activity detection stopped');
  },
})); 