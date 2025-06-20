export interface User {
  id: string;
  username: string;
  roomId: string;
  socketId: string;
  isAdmin: boolean;
  isMuted: boolean;
  isDeafened: boolean;
  joinedAt: Date;
  lastActivity: Date;
  audioSettings: {
    sampleRate: number;
    bitrate: number;
    channels: number;
    codec: string;
  };
}

export interface Room {
  id: string;
  name: string;
  description: string;
  users: User[];
  userCount?: number; // For real-time user count display
  maxUsers: number;
  isPrivate: boolean;
  password?: string;
  createdAt: Date;
  createdBy?: string;
  audioConfig: {
    codec: 'opus' | 'g722' | 'pcmu';
    sampleRate: 48000 | 44100 | 16000;
    bitrate: number;
    fec: boolean;
    dtx: boolean;
  };
}

export interface AudioDevice {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'audiooutput';
  groupId: string;
}

export interface VoiceSettings {
  inputDevice: string;
  outputDevice: string;
  micVolume: number;
  speakerVolume: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
  pushToTalk: boolean;
  pushToTalkKey: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  type: 'user' | 'system';
}

export interface VoiceConnection {
  userId: string;
  peerConnection: RTCPeerConnection;
  remoteStream?: MediaStream;
  audioElement?: HTMLAudioElement;
  isConnected: boolean;
  connectionState: RTCPeerConnectionState;
  isSpeaking: boolean;
  voiceActivityDetector?: VoiceActivityDetector;
  pendingIceCandidates?: RTCIceCandidateInit[]; // Queue for ICE candidates received before remote description
  webrtcStream?: MediaStream; // Separate stream for WebRTC transmission
}

export interface VoiceActivityDetector {
  audioContext: AudioContext;
  analyser: AnalyserNode;
  source: MediaStreamAudioSourceNode;
  dataArray: Uint8Array;
  threshold: number;
  isActive: boolean;
  onSpeakingChange: (speaking: boolean) => void;
}

export interface ServerConfig {
  server: {
    name: string;
    description: string;
    port: number;
    maxUsers: number;
    motd: string;
    password: string;
    requirePassword: boolean;
  };
  audio: {
    defaultCodec: 'opus' | 'g722' | 'pcmu';
    sampleRate: 48000 | 44100 | 16000;
    bitrate: number;
    fec: boolean;
    dtx: boolean;
    allowedCodecs: string[];
  };
  channels: {
    defaultChannelName: string;
    defaultChannelDescription: string;
    maxChannelsPerServer: number;
    maxUsersPerChannel: number;
    allowUserChannelCreation: boolean;
  };
  moderation: {
    enableAntispam: boolean;
    maxMessagesPerMinute: number;
    enableWordFilter: boolean;
    bannedWords: string[];
    logUserActions: boolean;
  };
  advanced: {
    enableLogging: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    enableMetrics: boolean;
    allowCrossOrigin: boolean;
    enableRateLimit: boolean;
    rateLimitWindow: number;
    rateLimitMax: number;
  };
}

export interface ServerInfo {
  name: string;
  description: string;
  motd: string;
  maxUsers: number;
  currentUsers: number;
  version: string;
  uptime: number;
  requirePassword: boolean;
  host?: string;
  port?: number;
  ping?: number;
  isOnline?: boolean;
}

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
  audioConstraints: MediaTrackConstraints;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error' | 'reconnecting';

// Socket event types - Client to Server
export interface ClientToServerEvents {
  authenticate: (data: { password: string }, callback: (response: any) => void) => void;
  'join-room': (data: { roomId: string; username: string; password?: string; audioSettings?: any }, callback: (response: any) => void) => void;
  'leave-room': () => void;
  'create-room': (data: { 
    name: string; 
    description: string; 
    maxUsers: number; 
    isPrivate: boolean; 
    password?: string; 
    audioConfig?: any 
  }, callback: (response: any) => void) => void;
  'get-rooms': () => void;
  'get-room-users': (data: { roomId: string }) => void;
  'chat-message': (data: { roomId: string; message: string }) => void;
  'user-mute-status': (data: { userId: string; isMuted?: boolean; isDeafened?: boolean }) => void;
  'get-server-info': (callback: (serverInfo: ServerInfo) => void) => void;
  
  // WebRTC signaling
  offer: (data: { targetUserId: string; offer: RTCSessionDescriptionInit }) => void;
  answer: (data: { targetUserId: string; answer: RTCSessionDescriptionInit }) => void;
  'ice-candidate': (data: { targetUserId: string; candidate: RTCIceCandidateInit }) => void;
}

// Socket event types - Server to Client
export interface ServerToClientEvents {
  'joined-room': (data: { roomId: string; userId: string; user: User; room: Room; audioConfig: any }) => void;
  'user-joined': (data: { user: User }) => void;
  'user-left': (data: { userId: string }) => void;
  'rooms-list': (rooms: Room[]) => void;
  'room-created': (data: { roomId: string; room: Room }) => void;
  'room-users': (data: { roomId: string; users: User[] }) => void;
  'chat-message': (message: ChatMessage) => void;
  'user-mute-changed': (data: { userId: string; isMuted?: boolean; isDeafened?: boolean }) => void;
  'server-info': (serverInfo: ServerInfo) => void;
  error: (data: { message: string }) => void;
  
  // WebRTC signaling
  offer: (data: { fromUserId: string; offer: RTCSessionDescriptionInit; audioConfig?: any }) => void;
  answer: (data: { fromUserId: string; answer: RTCSessionDescriptionInit }) => void;
  'ice-candidate': (data: { fromUserId: string; candidate: RTCIceCandidateInit }) => void;
}

export interface ChannelTreeProps {
  onDisconnect: () => void;
}

export interface ChatProps {
  // No additional props needed
}

export interface ServerBrowserProps {
  onConnect: (host: string, port: number, password?: string) => void;
  onServerSettings: () => void;
  onCreateServer: () => void;
}

export interface ServerSettingsProps {
  onClose: () => void;
  onStartServer: (config: ServerConfig) => void;
  onStopServer: () => void;
  serverRunning: boolean;
}

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
}; 