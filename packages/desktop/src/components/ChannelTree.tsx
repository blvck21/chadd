import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useVoiceStore } from "../stores/voiceStore";
import { useTheme } from "../contexts/ThemeContext";
import {
  FaPlus,
  FaUsers,
  FaChevronDown,
  FaMicrophone,
  FaMicrophoneSlash,
  FaHeadphones,
  FaVolumeMute,
  FaVolumeUp,
  FaCrown,
  FaCog,
  FaPhoneSlash,
  FaTimes,
  FaPalette,
  FaCircle,
} from "react-icons/fa";

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ChannelsSection = styled.div`
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  background: #2a2a2a;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #404040;
  margin-bottom: 10px;
`;

const Title = styled.h3`
  font-size: 14px;
  color: #ffd700;
  margin: 0;
`;

const AddButton = styled.button`
  background: #3a3a3a;
  border: 1px solid #505050;
  color: #e0e0e0;
  padding: 4px 8px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    background: #4a4a4a;
    border-color: #606060;
  }
`;

const ChannelItem = styled.div<{ active?: boolean }>`
  margin: 2px 0;
  border-radius: 5px;
  background: ${(props) => (props.active ? "#3a5998" : "transparent")};
  border: 1px solid ${(props) => (props.active ? "#4a69a8" : "transparent")};
  overflow: hidden;
`;

const ChannelHeader = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  font-size: 13px;
  color: ${(props) => (props.active ? "#ffffff" : "#d0d0d0")};

  &:hover {
    background: ${(props) => (props.active ? "#3a5998" : "#3a3a3a")};
  }
`;

const ChannelIcon = styled.div`
  margin-right: 8px;
  color: #90ee90;
`;

const ChannelName = styled.span`
  flex: 1;
`;

const UserCount = styled.span`
  color: #888;
  font-size: 11px;
  margin-left: 4px;
`;

const UsersList = styled.div<{ active?: boolean }>`
  background: ${(props) =>
    props.active ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.1)"};
  padding: 4px 0;
`;

const UserItem = styled.div.withConfig({
  shouldForwardProp: (prop) => !["speaking", "isCurrentUser"].includes(prop),
})<{ speaking?: boolean; isCurrentUser?: boolean }>`
  display: flex;
  align-items: center;
  padding: 4px 16px 4px 32px;
  font-size: 12px;
  color: ${(props) => (props.isCurrentUser ? "#ffd700" : "#d0d0d0")};
  background: ${(props) =>
    props.speaking ? "rgba(144, 238, 144, 0.15)" : "transparent"};
  border-left: 3px solid
    ${(props) => (props.speaking ? "#90ee90" : "transparent")};
  transition: all 0.2s ease;
`;

const UserAvatar = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "speaking",
})<{ speaking?: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3a3a3a, #5a5a5a);
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${(props) => (props.speaking ? "#90ee90" : "#505050")};
  box-shadow: ${(props) =>
    props.speaking ? "0 0 6px rgba(144, 238, 144, 0.6)" : "none"};
  transition: all 0.2s ease;
`;

const Username = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== "isAdmin",
})<{ isAdmin?: boolean }>`
  flex: 1;
  color: ${(props) => (props.isAdmin ? "#ffd700" : "inherit")};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const AudioIndicators = styled.div`
  display: flex;
  gap: 3px;
  align-items: center;
`;

const AudioIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => !["active", "color"].includes(prop),
})<{ active?: boolean; color?: string }>`
  color: ${(props) => (props.active ? props.color || "#90ee90" : "#666")};
  font-size: 10px;
`;

const CreateRoomForm = styled.div`
  background: #1a1a1a;
  border: 2px solid #404040;
  border-radius: 5px;
  padding: 15px;
  margin: 10px 0;
`;

const Input = styled.input`
  width: 100%;
  background: #2a2a2a;
  border: 1px solid #404040;
  color: #e0e0e0;
  padding: 6px 8px;
  border-radius: 3px;
  margin: 5px 0;
  font-size: 12px;

  &:focus {
    outline: none;
    border-color: #ffd700;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 10px;
`;

const Button = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== "primary",
})<{ primary?: boolean }>`
  flex: 1;
  background: ${(props) => (props.primary ? "#3a5998" : "#3a3a3a")};
  border: 1px solid ${(props) => (props.primary ? "#4a69a8" : "#505050")};
  color: #e0e0e0;
  padding: 6px 12px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    background: ${(props) => (props.primary ? "#4a69a8" : "#4a4a4a")};
  }
`;

// Voice Controls Section
const VoiceControls = styled.div`
  background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
  border-top: 2px solid #404040;
  padding: 12px;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px;
  background: #1a1a1a;
  border-radius: 5px;
  border: 1px solid #404040;
`;

const CurrentUserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3a3a3a, #5a5a5a);
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ffd700;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const CurrentUsername = styled.div`
  font-size: 13px;
  color: #ffd700;
  font-weight: bold;
`;

const UserStatus = styled.div`
  font-size: 11px;
  color: #888;
`;

const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ControlButton = styled.button<{ $active?: boolean; $danger?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 2px solid
    ${(props) =>
      props.$danger ? "#ff6b6b" : props.$active ? "#90ee90" : "#505050"};
  background: ${(props) =>
    props.$danger
      ? "rgba(255, 107, 107, 0.15)"
      : props.$active
      ? "rgba(144, 238, 144, 0.15)"
      : "#2a2a2a"};
  color: ${(props) =>
    props.$danger ? "#ff6b6b" : props.$active ? "#90ee90" : "#e0e0e0"};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 14px;
  box-shadow: ${(props) =>
    props.$active
      ? "0 0 8px rgba(144, 238, 144, 0.3)"
      : props.$danger
      ? "0 0 8px rgba(255, 107, 107, 0.3)"
      : "0 2px 4px rgba(0, 0, 0, 0.2)"};

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${(props) =>
      props.$active
        ? "0 0 12px rgba(144, 238, 144, 0.4)"
        : props.$danger
        ? "0 0 12px rgba(255, 107, 107, 0.4)"
        : "0 4px 8px rgba(0, 0, 0, 0.3)"};
    border-color: ${(props) =>
      props.$danger ? "#ff8a8a" : props.$active ? "#a8f0a8" : "#606060"};
  }

  &:active {
    transform: translateY(0);
  }
`;

const VolumeSlider = styled.input`
  flex: 1;
  height: 4px;
  background: #404040;
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;
  margin: 0 8px;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    background: #90ee90;
    border-radius: 50%;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 12px;
    height: 12px;
    background: #90ee90;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
`;

const DisconnectButton = styled.button`
  background: #ff6b6b;
  border: 1px solid #ff8a8a;
  color: white;
  padding: 6px 12px;
  border-radius: 15px;
  cursor: pointer;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  width: 100%;
  justify-content: center;

  &:hover {
    background: #ff8a8a;
  }
`;

const SettingsButton = styled.button`
  background: #3a3a3a;
  border: 1px solid #505050;
  color: #e0e0e0;
  padding: 6px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  transition: all 0.2s ease;

  &:hover {
    background: #4a4a4a;
    border-color: #606060;
    transform: rotate(90deg);
  }
`;

const SettingsOverlay = styled.div<{ show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: ${(props) => (props.show ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
`;

const SettingsModal = styled.div`
  background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
  border: 2px solid #404040;
  border-radius: 12px;
  padding: 24px;
  min-width: 400px;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
`;

const SettingsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #404040;
`;

const SettingsTitle = styled.h2`
  color: #ffd700;
  font-size: 18px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #fff;
    background: #404040;
  }
`;

const SettingsSection = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  color: #e0e0e0;
  font-size: 14px;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SettingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 8px;
  background: #1a1a1a;
  border-radius: 6px;
  border: 1px solid #404040;
`;

const SettingLabel = styled.span`
  color: #d0d0d0;
  font-size: 13px;
  flex: 1;
`;

const SettingValue = styled.span`
  color: #90ee90;
  font-size: 12px;
  min-width: 50px;
  text-align: right;
`;

const AudioTestButton = styled.button`
  background: #4a4a4a;
  border: 1px solid #606060;
  color: #e0e0e0;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;

  &:hover {
    background: #5a5a5a;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DeviceSelect = styled.select`
  background: #3a3a3a;
  border: 1px solid #505050;
  color: #e0e0e0;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 11px;
  min-width: 200px;

  &:focus {
    outline: none;
    border-color: #90ee90;
  }

  option {
    background: #3a3a3a;
    color: #e0e0e0;
  }
`;

const TestStatus = styled.div`
  font-size: 10px;
  color: #888;
  margin-top: 4px;
  text-align: center;
`;

const VolumeControlRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 8px 0;
`;

const VolumeIcon = styled.div`
  color: #888;
  font-size: 14px;
  width: 20px;
  display: flex;
  justify-content: center;
`;

const ExtendedVolumeSlider = styled.input`
  flex: 1;
  height: 6px;
  background: #404040;
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    background: #90ee90;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 8px rgba(144, 238, 144, 0.4);
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    background: #90ee90;
    border-radius: 50%;
    cursor: pointer;
    border: none;
    box-shadow: 0 0 8px rgba(144, 238, 144, 0.4);
  }
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #444;
  margin-bottom: 16px;
`;

const Tab = styled.button<{ active: boolean }>`
  background: ${(props) => (props.active ? "#3a3a3a" : "transparent")};
  border: none;
  color: ${(props) => (props.active ? "#00ff00" : "#888")};
  padding: 8px 16px;
  cursor: pointer;
  font-family: "Courier New", monospace;
  font-size: 11px;
  border-bottom: 2px solid
    ${(props) => (props.active ? "#00ff00" : "transparent")};

  &:hover {
    color: #00ff00;
    background: rgba(0, 255, 0, 0.05);
  }
`;

const ThemeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
`;

const ThemeCard = styled.div<{ active: boolean }>`
  background: #2a2a2a;
  border: 1px solid ${(props) => (props.active ? "#00ff00" : "#444")};
  border-radius: 4px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #00ff00;
    background: #333;
  }
`;

const ThemeName = styled.div`
  font-size: 12px;
  color: #00ff00;
  font-weight: bold;
  margin-bottom: 4px;
`;

const ThemeType = styled.div`
  font-size: 10px;
  color: #888;
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const ThemePreview = styled.div<{ colors: any }>`
  height: 40px;
  border-radius: 2px;
  background: ${(props) => props.colors.primary};
  border: 1px solid ${(props) => props.colors.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.colors.textPrimary};
  font-size: 10px;
  font-family: ${(props) =>
    props.colors.primary === "#0d1117" ? "monospace" : "inherit"};
`;

const ChannelTree: React.FC = () => {
  const {
    availableRooms,
    currentRoom,
    currentUser,
    joinRoom,
    leaveRoom,
    disconnect,
    username,
    socket,
    isConnected,
    isMuted,
    isDeafened,
    isSpeaking,
    micVolume,
    speakerVolume,
    toggleMute,
    toggleDeafen,
    setMicVolume,
    setSpeakerVolume,
    speakingUsers,
    audioStreams,
    roomUsers,
    getRoomUsers,
    showSettings,
    setShowSettings,
    showServerSettings,
    setShowServerSettings,
    serverConfig,
    setServerConfig,
    audioSettings,
    updateAudioSettings,
    isPttPressed,
    initializePttListeners,
    removePttListeners,
    currentInputLevel,
  } = useVoiceStore();

  const { themeName, setTheme, availableThemes } = useTheme();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDesc, setNewRoomDesc] = useState("");
  const [newRoomIcon, setNewRoomIcon] = useState("🏠");
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"audio" | "theme" | "general">(
    "audio"
  );
  const [audioDevices, setAudioDevices] = useState<{
    input: MediaDeviceInfo[];
    output: MediaDeviceInfo[];
  }>({ input: [], output: [] });
  const [selectedInputDevice, setSelectedInputDevice] = useState("default");
  const [selectedOutputDevice, setSelectedOutputDevice] = useState("default");
  const [isTesting, setIsTesting] = useState(false);
  const [testRecording, setTestRecording] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [channelIcons, setChannelIcons] = useState<Map<string, string>>(() => {
    console.log(`🔄 Loading channel icons from localStorage...`);

    try {
      const saved = localStorage.getItem("CHADD-channel-icons");
      console.log(`📱 Raw localStorage data:`, saved);

      if (saved) {
        const parsed: [string, string][] = JSON.parse(saved);
        const iconMap = new Map(parsed);

        console.log(`✅ Loaded ${iconMap.size} channel icons:`, {
          data: parsed,
          mapEntries: Array.from(iconMap.entries()),
        });

        return iconMap;
      } else {
        console.log(`ℹ️ No saved channel icons found, using defaults`);
      }
    } catch (error) {
      console.error("❌ Failed to load channel icons:", error);
    }

    const defaultMap = new Map([["default", "🏠"]]);
    console.log(
      `🏠 Using default channel icons:`,
      Array.from(defaultMap.entries())
    );
    return defaultMap;
  });
  const [showIconPicker, setShowIconPicker] = useState<string | null>(null);

  const availableIcons = [
    "🏠",
    "🎮",
    "🎵",
    "💬",
    "🔊",
    "🎯",
    "⚡",
    "🌟",
    "🔥",
    "💎",
    "🎭",
    "🚀",
    "🎪",
    "🏆",
    "🎨",
    "🎬",
  ];

  const saveChannelIcon = (roomId: string, icon: string) => {
    console.log(`💾 Saving icon "${icon}" for channel "${roomId}"`);

    const newIcons = new Map(channelIcons);
    newIcons.set(roomId, icon);
    setChannelIcons(newIcons);

    try {
      const iconArray = Array.from(newIcons.entries());
      const jsonString = JSON.stringify(iconArray);
      localStorage.setItem("CHADD-channel-icons", jsonString);

      console.log(`✅ Icon saved successfully:`, {
        roomId,
        icon,
        totalIcons: newIcons.size,
        storedData: jsonString,
      });

      // Verify the save worked
      const verification = localStorage.getItem("CHADD-channel-icons");
      if (verification === jsonString) {
        console.log(`✅ Icon save verified in localStorage`);
      } else {
        console.error(`❌ Icon save verification failed!`, {
          expected: jsonString,
          actual: verification,
        });
      }
    } catch (error) {
      console.error(`❌ Failed to save channel icon:`, error);
    }
  };

  // Load available audio devices
  useEffect(() => {
    const loadDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const inputDevices = devices.filter(
          (device) => device.kind === "audioinput"
        );
        const outputDevices = devices.filter(
          (device) => device.kind === "audiooutput"
        );

        setAudioDevices({ input: inputDevices, output: outputDevices });
      } catch (error) {
        console.error("Error loading audio devices:", error);
      }
    };

    if (showSettings) {
      loadDevices();
    }
  }, [showSettings]);

  // Initialize PTT listeners when voice mode changes
  useEffect(() => {
    if (audioSettings.voiceMode === "ptt") {
      initializePttListeners();
    } else {
      removePttListeners();
    }

    // Cleanup on unmount
    return () => {
      removePttListeners();
    };
  }, [audioSettings.voiceMode, audioSettings.pttKey]); // Removed function dependencies

  // Only request user counts once when initially connected
  useEffect(() => {
    if (isConnected && availableRooms.length > 0) {
      // Only request if we don't have user data yet
      availableRooms.forEach((room) => {
        if (!roomUsers.has(room.id)) {
          getRoomUsers(room.id);
        }
      });
    }
  }, [isConnected, availableRooms.length]); // Removed getRoomUsers and roomUsers from deps

  // Load server config
  useEffect(() => {
    const loadServerConfig = async () => {
      if (showServerSettings && isConnected) {
        try {
          // Get server connection details from voice store
          const { serverHost, serverPort } = useVoiceStore.getState();

          if (!serverHost || !serverPort) {
            console.error("No server connection details available");
            return;
          }

          // Fetch from server API
          const response = await fetch(
            `http://${serverHost}:${serverPort}/api/config`
          );
          if (response.ok) {
            const config = await response.json();
            setServerConfig({
              name: config.server.name,
              description: config.server.description,
              motd: config.server.motd,
              maxUsers: config.server.maxUsers,
              requirePassword: config.server.requirePassword,
              password: config.server.password,
              port: config.server.port,
            });
          } else {
            console.error("Failed to load server config:", response.statusText);
          }
        } catch (error) {
          console.error("Error loading server config:", error);
          // Fallback to localStorage
          const savedConfig = localStorage.getItem("CHADD-server-config");
          if (savedConfig) {
            setServerConfig(JSON.parse(savedConfig));
          }
        }
      }
    };

    loadServerConfig();
  }, [showServerSettings, isConnected]);

  const saveServerConfig = async () => {
    if (!isConnected) {
      alert("Not connected to server. Cannot save configuration.");
      return;
    }

    try {
      // Get server connection details from voice store
      const { serverHost, serverPort } = useVoiceStore.getState();

      if (!serverHost || !serverPort) {
        console.error("No server connection details available");
        alert(
          "No server connection details available. Cannot save configuration."
        );
        return;
      }

      // Prepare full config structure
      const fullConfig = {
        server: {
          name: serverConfig.name,
          description: serverConfig.description,
          port: serverConfig.port,
          maxUsers: serverConfig.maxUsers,
          motd: serverConfig.motd,
          password: serverConfig.password,
          requirePassword: serverConfig.requirePassword,
        },
        // Keep existing sections
        audio: {
          defaultCodec: "opus",
          sampleRate: 48000,
          bitrate: 64000,
          fec: true,
          dtx: true,
          allowedCodecs: ["opus", "g722", "pcmu"],
        },
        channels: {
          defaultChannelName: "Main Hall",
          defaultChannelDescription: "Welcome to the main channel!",
          maxChannelsPerServer: 50,
          maxUsersPerChannel: 50,
          allowUserChannelCreation: true,
        },
        moderation: {
          enableAntispam: true,
          maxMessagesPerMinute: 10,
          enableWordFilter: false,
          bannedWords: [],
          logUserActions: true,
        },
        advanced: {
          enableLogging: true,
          logLevel: "info",
          enableMetrics: true,
          allowCrossOrigin: true,
          enableRateLimit: true,
          rateLimitWindow: 60000,
          rateLimitMax: 100,
        },
      };

      const response = await fetch(
        `http://${serverHost}:${serverPort}/api/config`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(fullConfig),
        }
      );

      if (response.ok) {
        alert(
          "Server configuration saved successfully! Changes will take effect on server restart."
        );
        setShowServerSettings(false);
      } else {
        const error = await response.json();
        alert(`Failed to save configuration: ${error.error}`);
      }
    } catch (error) {
      console.error("Error saving server config:", error);
      // Fallback to localStorage
      localStorage.setItem("CHADD-server-config", JSON.stringify(serverConfig));
      alert(
        "Failed to save to server. Saved locally instead. Server must be restarted to apply changes."
      );
      setShowServerSettings(false);
    }
  };

  // Microphone test functions
  const startMicTest = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId:
            selectedInputDevice === "default" ? undefined : selectedInputDevice,
        },
      });

      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" });
        setTestRecording(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsTesting(true);

      // Auto-stop after 3 seconds
      setTimeout(() => {
        stopMicTest();
      }, 3000);
    } catch (error) {
      console.error("Error starting microphone test:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopMicTest = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }
    setIsTesting(false);
  };

  const playTestRecording = () => {
    if (testRecording) {
      const audio = new Audio(URL.createObjectURL(testRecording));
      audio
        .play()
        .catch((error) =>
          console.error("Error playing test recording:", error)
        );
    }
  };

  const handleJoinRoom = (roomId: string) => {
    if (!username) {
      const name = prompt("Enter your username:");
      if (name) {
        joinRoom(roomId, name);
      }
    } else {
      joinRoom(roomId);
    }
  };

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) return;

    socket?.emit(
      "create-room",
      {
        name: newRoomName,
        description: newRoomDesc,
        maxUsers: 20,
        isPrivate: false,
        audioConfig: {
          codec: "opus",
          sampleRate: 48000,
          bitrate: 64000,
          fec: true,
          dtx: true,
        },
      },
      (response: any) => {
        console.log("Create room response:", response);
        if (response?.success) {
          console.log("Room created successfully:", response.room);

          // Save the selected icon for the new room
          if (response.room?.id) {
            saveChannelIcon(response.room.id, newRoomIcon);
          }

          // Clear form and close it
          setNewRoomName("");
          setNewRoomDesc("");
          setNewRoomIcon("🏠");
          setShowCreateForm(false);

          // Request updated room list
          socket?.emit("get-rooms");
        } else {
          console.error("Failed to create room:", response?.error);
          // If user not found, try to re-register the user
          if (response?.error === "User not found" && username) {
            console.log("Attempting to re-register user for room creation...");

            // Set a timeout for the retry attempt
            const retryTimeoutId = setTimeout(() => {
              console.log(
                "User re-registration timeout, trying room creation anyway..."
              );
              // Try room creation again even if re-registration times out
              socket?.emit(
                "create-room",
                {
                  name: newRoomName,
                  description: newRoomDesc,
                  maxUsers: 20,
                  isPrivate: false,
                  audioConfig: {
                    codec: "opus",
                    sampleRate: 48000,
                    bitrate: 64000,
                    fec: true,
                    dtx: true,
                  },
                },
                (finalResponse: any) => {
                  if (finalResponse?.success) {
                    console.log(
                      "Room created successfully after timeout retry"
                    );
                    setNewRoomName("");
                    setNewRoomDesc("");
                    setNewRoomIcon("🏠");
                    setShowCreateForm(false);
                    socket?.emit("get-rooms");
                  } else {
                    console.error(
                      "Failed to create room after timeout retry:",
                      finalResponse?.error
                    );
                    // Use console instead of alert to avoid Tauri allowlist issues
                  }
                }
              );
            }, 2000);

            socket?.emit("join-as-user", { username }, (userResponse: any) => {
              clearTimeout(retryTimeoutId);
              if (userResponse?.success) {
                console.log("User re-registered, retrying room creation...");
                // Retry room creation
                socket?.emit(
                  "create-room",
                  {
                    name: newRoomName,
                    description: newRoomDesc,
                    maxUsers: 20,
                    isPrivate: false,
                    audioConfig: {
                      codec: "opus",
                      sampleRate: 48000,
                      bitrate: 64000,
                      fec: true,
                      dtx: true,
                    },
                  },
                  (retryResponse: any) => {
                    if (retryResponse?.success) {
                      console.log("Room created successfully after retry");
                      setNewRoomName("");
                      setNewRoomDesc("");
                      setNewRoomIcon("🏠");
                      setShowCreateForm(false);
                      socket?.emit("get-rooms");
                    } else {
                      console.error(
                        "Failed to create room after retry:",
                        retryResponse?.error
                      );
                      // Use console instead of alert to avoid Tauri allowlist issues
                    }
                  }
                );
              } else {
                console.log(
                  "User re-registration failed, trying room creation anyway..."
                );
                // Try room creation even if re-registration fails (server now has fallback)
                socket?.emit(
                  "create-room",
                  {
                    name: newRoomName,
                    description: newRoomDesc,
                    maxUsers: 20,
                    isPrivate: false,
                    audioConfig: {
                      codec: "opus",
                      sampleRate: 48000,
                      bitrate: 64000,
                      fec: true,
                      dtx: true,
                    },
                  },
                  (fallbackResponse: any) => {
                    if (fallbackResponse?.success) {
                      console.log(
                        "Room created successfully with server fallback"
                      );
                      setNewRoomName("");
                      setNewRoomDesc("");
                      setNewRoomIcon("🏠");
                      setShowCreateForm(false);
                      socket?.emit("get-rooms");
                    } else {
                      console.error(
                        "Failed to create room with server fallback:",
                        fallbackResponse?.error
                      );
                      // Use console instead of alert to avoid Tauri allowlist issues
                    }
                  }
                );
              }
            });
          } else {
            console.error("Failed to create room:", response?.error);
            // Use console instead of alert to avoid Tauri allowlist issues
          }
        }
      }
    );
  };

  // Debug function for channel icons
  const debugChannelIcons = () => {
    console.log("🔍 DEBUG: Channel Icons State");
    console.log(
      "Current channelIcons Map:",
      Array.from(channelIcons.entries())
    );

    const stored = localStorage.getItem("CHADD-channel-icons");
    console.log("Raw localStorage data:", stored);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log("Parsed localStorage data:", parsed);
        console.log("Recreated Map:", Array.from(new Map(parsed).entries()));
      } catch (error) {
        console.error("Error parsing stored data:", error);
      }
    }

    console.log("Available rooms:");
    availableRooms.forEach((room) => {
      console.log(
        `- ${room.id}: "${room.name}" -> Icon: ${
          channelIcons.get(room.id) || "🏠 (default)"
        }`
      );
    });
  };

  // Expose debug function globally for easy access
  useEffect(() => {
    (window as any).debugChannelIcons = debugChannelIcons;
    return () => {
      delete (window as any).debugChannelIcons;
    };
  }, [channelIcons, availableRooms]);

  return (
    <Container>
      <ChannelsSection>
        <Header>
          <Title>🏠 CHANNELS</Title>
          <AddButton onClick={() => setShowCreateForm(!showCreateForm)}>
            <FaPlus />
          </AddButton>
        </Header>

        {showCreateForm && (
          <CreateRoomForm>
            <Input
              type="text"
              placeholder="Room Name"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Description (optional)"
              value={newRoomDesc}
              onChange={(e) => setNewRoomDesc(e.target.value)}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                margin: "8px 0",
              }}
            >
              <span style={{ color: "#90ee90", fontSize: "12px" }}>Icon:</span>
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                {availableIcons.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setNewRoomIcon(icon)}
                    style={{
                      background:
                        newRoomIcon === icon ? "#404040" : "transparent",
                      border:
                        newRoomIcon === icon
                          ? "1px solid #90ee90"
                          : "1px solid #333",
                      borderRadius: "4px",
                      padding: "4px 6px",
                      fontSize: "14px",
                      cursor: "pointer",
                      color: "#fff",
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <ButtonGroup>
              <Button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewRoomName("");
                  setNewRoomDesc("");
                  setNewRoomIcon("🏠");
                }}
              >
                Cancel
              </Button>
              <Button primary onClick={handleCreateRoom}>
                Create
              </Button>
            </ButtonGroup>
          </CreateRoomForm>
        )}

        {availableRooms.map((room) => {
          const isActive = currentRoom?.id === room.id;
          const isExpanded = expandedRooms.has(room.id);
          const displayUsers = isActive
            ? currentRoom?.users
            : roomUsers.get(room.id);
          // Always use the most up-to-date user count - prioritize real-time userCount from server
          const userCount =
            room.userCount ??
            roomUsers.get(room.id)?.length ??
            (isActive ? currentRoom?.users?.length || 0 : 0);

          return (
            <ChannelItem key={room.id} active={isActive}>
              <ChannelHeader
                active={isActive}
                onClick={() => handleJoinRoom(room.id)}
              >
                <ChannelIcon
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowIconPicker(room.id);
                  }}
                  style={{ cursor: "pointer", fontSize: "16px" }}
                  title="Click to change icon"
                >
                  {channelIcons.get(room.id) || "🏠"}
                </ChannelIcon>
                <ChannelName>{room.name}</ChannelName>
                <UserCount>({userCount})</UserCount>
                {displayUsers && displayUsers.length > 0 && (
                  <FaChevronDown
                    size={10}
                    style={{
                      transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                      transition: "transform 0.2s",
                      cursor: "pointer",
                      marginLeft: "4px",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedRooms((prev) => {
                        const newSet = new Set(prev);
                        if (newSet.has(room.id)) {
                          newSet.delete(room.id);
                        } else {
                          newSet.add(room.id);
                        }
                        return newSet;
                      });
                    }}
                  />
                )}
              </ChannelHeader>

              {(isActive || isExpanded) &&
                displayUsers &&
                displayUsers.length > 0 && (
                  <UsersList active={isActive}>
                    {displayUsers.map((user) => {
                      const isCurrentUser = user.id === currentUser?.id;
                      const isSpeaking = speakingUsers.has(user.id);

                      return (
                        <UserItem
                          key={user.id}
                          speaking={isSpeaking}
                          isCurrentUser={isCurrentUser}
                        >
                          <UserAvatar speaking={isSpeaking}>
                            <FaCircle size={6} />
                          </UserAvatar>
                          <Username isAdmin={user.isAdmin}>
                            {user.isAdmin && <FaCrown size={8} />}
                            {user.username}
                            {isCurrentUser && " (you)"}
                          </Username>
                          <AudioIndicators>
                            <AudioIcon
                              active={
                                isCurrentUser
                                  ? !isMuted && !isDeafened
                                  : !user.isMuted && !user.isDeafened
                              }
                              color={
                                isCurrentUser
                                  ? isMuted || isDeafened
                                    ? "#ff6b6b"
                                    : "#90ee90"
                                  : user.isMuted || user.isDeafened
                                  ? "#ff6b6b"
                                  : "#90ee90"
                              }
                            >
                              {isCurrentUser ? (
                                isMuted || isDeafened ? (
                                  <FaMicrophoneSlash />
                                ) : (
                                  <FaMicrophone />
                                )
                              ) : user.isMuted || user.isDeafened ? (
                                <FaMicrophoneSlash />
                              ) : (
                                <FaMicrophone />
                              )}
                            </AudioIcon>
                            <AudioIcon
                              active={
                                isCurrentUser ? !isDeafened : !user.isDeafened
                              }
                              color={
                                isCurrentUser
                                  ? isDeafened
                                    ? "#ff6b6b"
                                    : "#90ee90"
                                  : user.isDeafened
                                  ? "#ff6b6b"
                                  : "#90ee90"
                              }
                            >
                              {isCurrentUser ? (
                                isDeafened ? (
                                  <FaVolumeMute />
                                ) : (
                                  <FaHeadphones />
                                )
                              ) : user.isDeafened ? (
                                <FaVolumeMute />
                              ) : (
                                <FaHeadphones />
                              )}
                            </AudioIcon>
                          </AudioIndicators>
                        </UserItem>
                      );
                    })}
                  </UsersList>
                )}
            </ChannelItem>
          );
        })}
      </ChannelsSection>

      <VoiceControls>
        {currentUser && (
          <UserSection>
            <CurrentUserAvatar>
              <FaCircle size={10} />
            </CurrentUserAvatar>
            <UserInfo>
              <CurrentUsername>{currentUser.username}</CurrentUsername>
              <UserStatus>
                {currentRoom ? `In ${currentRoom.name}` : "Not in a channel"}
              </UserStatus>
            </UserInfo>
          </UserSection>
        )}

        <ControlsRow>
          <ControlButton
            $active={!isMuted}
            $danger={isMuted}
            onClick={toggleMute}
            title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
          >
            {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </ControlButton>

          <VolumeSlider
            type="range"
            min="0"
            max="100"
            value={micVolume}
            onChange={(e) => setMicVolume(Number(e.target.value))}
            title={`Mic Volume: ${micVolume}%`}
          />

          <ControlButton
            $active={!isDeafened}
            $danger={isDeafened}
            onClick={toggleDeafen}
            title={isDeafened ? "Undeafen Headphones" : "Deafen Headphones"}
          >
            {isDeafened ? <FaVolumeMute /> : <FaHeadphones />}
          </ControlButton>

          <VolumeSlider
            type="range"
            min="0"
            max="100"
            value={speakerVolume}
            onChange={(e) => setSpeakerVolume(Number(e.target.value))}
            title={`Speaker Volume: ${speakerVolume}%`}
          ></VolumeSlider>

          <SettingsButton
            onClick={() => setShowSettings(true)}
            title="Audio Settings"
          >
            <FaCog />
          </SettingsButton>

          <SettingsButton
            onClick={() => setShowServerSettings(true)}
            title="Server Config"
            style={{ marginLeft: "5px" }}
          >
            ⚙️
          </SettingsButton>
        </ControlsRow>

        {currentRoom && (
          <DisconnectButton onClick={leaveRoom}>
            <FaPhoneSlash />
            Leave Channel
          </DisconnectButton>
        )}

        {isConnected && (
          <DisconnectButton
            onClick={disconnect}
            style={{
              background: "#ff4444",
              borderColor: "#ff6666",
              marginTop: "5px",
            }}
          >
            <FaTimes />
            Disconnect Server
          </DisconnectButton>
        )}
      </VoiceControls>

      {/* Settings Modal */}
      <SettingsOverlay
        show={showSettings}
        onClick={() => setShowSettings(false)}
      >
        <SettingsModal onClick={(e) => e.stopPropagation()}>
          <SettingsHeader>
            <SettingsTitle>
              <FaCog />
              Settings
            </SettingsTitle>
            <CloseButton onClick={() => setShowSettings(false)}>
              <FaTimes />
            </CloseButton>
          </SettingsHeader>

          <TabContainer>
            <Tab
              active={activeTab === "audio"}
              onClick={() => setActiveTab("audio")}
            >
              🎤 Audio
            </Tab>
            <Tab
              active={activeTab === "theme"}
              onClick={() => setActiveTab("theme")}
            >
              🎨 Theme
            </Tab>
            <Tab
              active={activeTab === "general"}
              onClick={() => setActiveTab("general")}
            >
              ℹ️ Info
            </Tab>
          </TabContainer>

          {activeTab === "audio" && (
            <>
              <SettingsSection>
                <SectionTitle>
                  <FaMicrophone />
                  Microphone
                </SectionTitle>

                <SettingRow>
                  <SettingLabel>Input Device</SettingLabel>
                  <DeviceSelect
                    value={audioSettings.inputDeviceId}
                    onChange={(e) => {
                      updateAudioSettings({ inputDeviceId: e.target.value });
                      setSelectedInputDevice(e.target.value);
                    }}
                  >
                    <option value="default">Default Microphone</option>
                    {audioDevices.input.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label ||
                          `Microphone ${device.deviceId.slice(0, 8)}...`}
                      </option>
                    ))}
                  </DeviceSelect>
                </SettingRow>

                <VolumeControlRow>
                  <VolumeIcon>
                    <FaMicrophone />
                  </VolumeIcon>
                  <ExtendedVolumeSlider
                    type="range"
                    min="0"
                    max="100"
                    value={audioSettings.inputVolume}
                    onChange={(e) =>
                      updateAudioSettings({
                        inputVolume: Number(e.target.value),
                      })
                    }
                  />
                  <SettingValue>{audioSettings.inputVolume}%</SettingValue>
                </VolumeControlRow>

                <SettingRow>
                  <SettingLabel>Input Level</SettingLabel>
                  <div
                    style={{
                      width: "100%",
                      height: "8px",
                      background: "#333",
                      borderRadius: "4px",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        width: `${currentInputLevel}%`,
                        height: "100%",
                        background:
                          currentInputLevel > 80
                            ? "#ff6b6b"
                            : currentInputLevel > 50
                            ? "#ffd700"
                            : "#90ee90",
                        transition: "width 0.1s ease",
                        borderRadius: "4px",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        right: "4px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "10px",
                        color: "#fff",
                        fontWeight: "bold",
                        textShadow: "1px 1px 1px rgba(0,0,0,0.8)",
                      }}
                    >
                      {Math.round(currentInputLevel)}%
                    </div>
                  </div>
                </SettingRow>

                <SettingRow>
                  <SettingLabel>Microphone Status</SettingLabel>
                  <SettingValue>
                    {isMuted ? "🔇 Muted" : "🎤 Active"}
                  </SettingValue>
                </SettingRow>

                <SettingRow>
                  <SettingLabel>Test Microphone</SettingLabel>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div style={{ display: "flex", gap: "8px" }}>
                      <AudioTestButton
                        onClick={isTesting ? stopMicTest : startMicTest}
                        disabled={isMuted}
                      >
                        {isTesting ? "🔴 Recording..." : "🎤 Record Test"}
                      </AudioTestButton>

                      {testRecording && (
                        <AudioTestButton onClick={playTestRecording}>
                          🔊 Play Recording
                        </AudioTestButton>
                      )}
                    </div>

                    {isTesting && (
                      <TestStatus>
                        Recording for 3 seconds... Speak now!
                      </TestStatus>
                    )}

                    {testRecording && !isTesting && (
                      <TestStatus>
                        ✅ Recording complete! Click "Play Recording" to hear
                        yourself.
                      </TestStatus>
                    )}
                  </div>
                </SettingRow>
              </SettingsSection>

              <SettingsSection>
                <SectionTitle>🎙️ Voice Transmission</SectionTitle>

                <SettingRow>
                  <SettingLabel>Voice Mode</SettingLabel>
                  <DeviceSelect
                    value={audioSettings.voiceMode}
                    onChange={(e) =>
                      updateAudioSettings({
                        voiceMode: e.target.value as
                          | "vad"
                          | "ptt"
                          | "always"
                          | "raw",
                      })
                    }
                  >
                    <option value="vad">🎤 Voice Activity Detection</option>
                    <option value="ptt">⌨️ Push-to-Talk</option>
                    <option value="always">🔊 Always On</option>
                    <option value="raw">🎚️ Raw Audio (No Processing)</option>
                  </DeviceSelect>
                </SettingRow>

                {audioSettings.voiceMode === "ptt" && (
                  <SettingRow>
                    <SettingLabel>Push-to-Talk Key</SettingLabel>
                    <DeviceSelect
                      value={audioSettings.pttKey}
                      onChange={(e) =>
                        updateAudioSettings({ pttKey: e.target.value })
                      }
                    >
                      <option value="Space">Space</option>
                      <option value="ControlLeft">Left Ctrl</option>
                      <option value="ControlRight">Right Ctrl</option>
                      <option value="AltLeft">Left Alt</option>
                      <option value="AltRight">Right Alt</option>
                      <option value="ShiftLeft">Left Shift</option>
                      <option value="ShiftRight">Right Shift</option>
                      <option value="KeyV">V</option>
                      <option value="KeyB">B</option>
                      <option value="KeyT">T</option>
                    </DeviceSelect>
                  </SettingRow>
                )}

                {audioSettings.voiceMode === "vad" && (
                  <SettingRow>
                    <SettingLabel>Enable Voice Detection</SettingLabel>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={audioSettings.vadEnabled}
                        onChange={(e) =>
                          updateAudioSettings({ vadEnabled: e.target.checked })
                        }
                        style={{ cursor: "pointer" }}
                      />
                      <span>
                        {audioSettings.vadEnabled
                          ? "✅ Enabled"
                          : "❌ Disabled"}
                      </span>
                    </label>
                  </SettingRow>
                )}

                {audioSettings.voiceMode === "vad" &&
                  audioSettings.vadEnabled && (
                    <>
                      <SettingRow>
                        <SettingLabel>Voice Threshold</SettingLabel>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            width: "100%",
                          }}
                        >
                          <ExtendedVolumeSlider
                            type="range"
                            min="5"
                            max="100"
                            value={audioSettings.vadThreshold}
                            onChange={(e) =>
                              updateAudioSettings({
                                vadThreshold: Number(e.target.value),
                              })
                            }
                          />
                          <SettingValue>
                            {audioSettings.vadThreshold}
                          </SettingValue>
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                            marginTop: "4px",
                          }}
                        >
                          Lower = more sensitive (picks up quieter sounds)
                        </div>
                      </SettingRow>

                      <SettingRow>
                        <SettingLabel>Audio Smoothing</SettingLabel>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            width: "100%",
                          }}
                        >
                          <ExtendedVolumeSlider
                            type="range"
                            min="0.1"
                            max="0.9"
                            step="0.1"
                            value={audioSettings.vadSmoothingTimeConstant}
                            onChange={(e) =>
                              updateAudioSettings({
                                vadSmoothingTimeConstant: Number(
                                  e.target.value
                                ),
                              })
                            }
                          />
                          <SettingValue>
                            {audioSettings.vadSmoothingTimeConstant}
                          </SettingValue>
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                            marginTop: "4px",
                          }}
                        >
                          Higher = smoother but slower response
                        </div>
                      </SettingRow>

                      <SettingRow>
                        <SettingLabel>Response Time</SettingLabel>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            width: "100%",
                          }}
                        >
                          <ExtendedVolumeSlider
                            type="range"
                            min="50"
                            max="500"
                            step="50"
                            value={audioSettings.vadDebounceTime}
                            onChange={(e) =>
                              updateAudioSettings({
                                vadDebounceTime: Number(e.target.value),
                              })
                            }
                          />
                          <SettingValue>
                            {audioSettings.vadDebounceTime}ms
                          </SettingValue>
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                            marginTop: "4px",
                          }}
                        >
                          Lower = faster response, Higher = less choppy
                        </div>
                      </SettingRow>
                    </>
                  )}

                <SettingRow>
                  <SettingLabel>Echo Cancellation</SettingLabel>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={audioSettings.echoCancellation}
                      onChange={(e) =>
                        updateAudioSettings({
                          echoCancellation: e.target.checked,
                        })
                      }
                      style={{ cursor: "pointer" }}
                    />
                    <span>
                      {audioSettings.echoCancellation
                        ? "✅ Enabled"
                        : "❌ Disabled"}
                    </span>
                  </label>
                </SettingRow>

                <SettingRow>
                  <SettingLabel>Noise Suppression</SettingLabel>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={audioSettings.noiseSuppression}
                      onChange={(e) =>
                        updateAudioSettings({
                          noiseSuppression: e.target.checked,
                        })
                      }
                      style={{ cursor: "pointer" }}
                    />
                    <span>
                      {audioSettings.noiseSuppression
                        ? "✅ Enabled"
                        : "❌ Disabled"}
                    </span>
                  </label>
                </SettingRow>

                <SettingRow>
                  <SettingLabel>Auto Gain Control</SettingLabel>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={audioSettings.autoGainControl}
                      onChange={(e) =>
                        updateAudioSettings({
                          autoGainControl: e.target.checked,
                        })
                      }
                      style={{ cursor: "pointer" }}
                    />
                    <span>
                      {audioSettings.autoGainControl
                        ? "✅ Enabled"
                        : "❌ Disabled"}
                    </span>
                  </label>
                </SettingRow>

                <SettingRow>
                  <SettingLabel>Voice Status</SettingLabel>
                  <SettingValue>
                    {audioSettings.voiceMode === "vad"
                      ? isSpeaking
                        ? "🗣️ Speaking (VAD)"
                        : "🔇 Silent (VAD)"
                      : audioSettings.voiceMode === "ptt"
                      ? isPttPressed
                        ? "🗣️ PTT Active"
                        : "⌨️ Press Key to Talk"
                      : audioSettings.voiceMode === "always"
                      ? "🔊 Always Transmitting"
                      : "🎚️ Raw Audio Active"}
                  </SettingValue>
                </SettingRow>
              </SettingsSection>

              <SettingsSection>
                <SectionTitle>
                  <FaHeadphones />
                  Audio Output
                </SectionTitle>

                <SettingRow>
                  <SettingLabel>Output Device</SettingLabel>
                  <DeviceSelect
                    value={audioSettings.outputDeviceId}
                    onChange={(e) => {
                      updateAudioSettings({ outputDeviceId: e.target.value });
                      setSelectedOutputDevice(e.target.value);
                    }}
                  >
                    <option value="default">Default Speakers</option>
                    {audioDevices.output.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label ||
                          `Speaker ${device.deviceId.slice(0, 8)}...`}
                      </option>
                    ))}
                  </DeviceSelect>
                </SettingRow>

                <VolumeControlRow>
                  <VolumeIcon>
                    <FaVolumeUp />
                  </VolumeIcon>
                  <ExtendedVolumeSlider
                    type="range"
                    min="0"
                    max="100"
                    value={audioSettings.outputVolume}
                    onChange={(e) => {
                      updateAudioSettings({
                        outputVolume: Number(e.target.value),
                      });
                      setSpeakerVolume(Number(e.target.value));
                    }}
                  />
                  <SettingValue>{audioSettings.outputVolume}%</SettingValue>
                </VolumeControlRow>

                <SettingRow>
                  <SettingLabel>Audio Output Status</SettingLabel>
                  <SettingValue>
                    {isDeafened ? "🔇 Deafened" : "🔊 Active"}
                  </SettingValue>
                </SettingRow>

                <SettingRow>
                  <SettingLabel>Test Audio Output</SettingLabel>
                  <AudioTestButton
                    onClick={() => {
                      const audio = new Audio(
                        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwZCTKM1PLZdyoFA2q69f+8pGEgAzKQ2u/ZdjMEBWm09/WXUR0UNJvZ8+OQPwo"
                      );
                      if (
                        selectedOutputDevice !== "default" &&
                        (audio as any).setSinkId
                      ) {
                        (audio as any).setSinkId(selectedOutputDevice);
                      }
                      audio
                        .play()
                        .catch(() =>
                          console.log("Audio test - you should hear a beep!")
                        );
                    }}
                  >
                    🔊 Test Beep
                  </AudioTestButton>
                </SettingRow>
              </SettingsSection>
            </>
          )}

          {activeTab === "theme" && (
            <SettingsSection>
              <SectionTitle>
                <FaPalette />
                Appearance
              </SectionTitle>

              <SettingRow>
                <SettingLabel>Current Theme</SettingLabel>
                <SettingValue>
                  {availableThemes[themeName]?.displayName}
                </SettingValue>
              </SettingRow>

              <ThemeGrid>
                {Object.entries(availableThemes).map(([themeKey, theme]) => (
                  <ThemeCard
                    key={themeKey}
                    active={themeName === themeKey}
                    onClick={() => setTheme(themeKey as any)}
                  >
                    <ThemeName>{theme.displayName}</ThemeName>
                    <ThemeType>{theme.type}</ThemeType>
                    <ThemePreview colors={theme.colors}>
                      Sample Text
                    </ThemePreview>
                  </ThemeCard>
                ))}
              </ThemeGrid>
            </SettingsSection>
          )}

          {activeTab === "general" && (
            <SettingsSection>
              <SectionTitle>
                <FaUsers />
                Connection Info
              </SectionTitle>

              <SettingRow>
                <SettingLabel>Connection Status</SettingLabel>
                <SettingValue>
                  {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
                </SettingValue>
              </SettingRow>

              <SettingRow>
                <SettingLabel>Current Channel</SettingLabel>
                <SettingValue>
                  {currentRoom ? currentRoom.name : "None"}
                </SettingValue>
              </SettingRow>

              <SettingRow>
                <SettingLabel>Users in Channel</SettingLabel>
                <SettingValue>
                  {currentRoom ? currentRoom.users?.length || 0 : 0} users
                </SettingValue>
              </SettingRow>

              <SettingRow>
                <SettingLabel>Audio Streams</SettingLabel>
                <SettingValue>{audioStreams.size} active</SettingValue>
              </SettingRow>
            </SettingsSection>
          )}
        </SettingsModal>
      </SettingsOverlay>

      {/* Server Settings Modal */}
      <SettingsOverlay
        show={showServerSettings}
        onClick={() => setShowServerSettings(false)}
      >
        <SettingsModal onClick={(e) => e.stopPropagation()}>
          <SettingsHeader>
            <SettingsTitle>⚙️ Server Configuration</SettingsTitle>
            <CloseButton onClick={() => setShowServerSettings(false)}>
              <FaTimes />
            </CloseButton>
          </SettingsHeader>

          <SettingsSection>
            <SectionTitle>🏠 Server Info</SectionTitle>

            <SettingRow>
              <SettingLabel>Server Name</SettingLabel>
              <Input
                type="text"
                value={serverConfig.name}
                onChange={(e) =>
                  setServerConfig({ ...serverConfig, name: e.target.value })
                }
                placeholder="Server Name"
              />
            </SettingRow>

            <SettingRow>
              <SettingLabel>Description</SettingLabel>
              <Input
                type="text"
                value={serverConfig.description}
                onChange={(e) =>
                  setServerConfig({
                    ...serverConfig,
                    description: e.target.value,
                  })
                }
                placeholder="Server Description"
              />
            </SettingRow>

            <SettingRow>
              <SettingLabel>MOTD</SettingLabel>
              <Input
                type="text"
                value={serverConfig.motd}
                onChange={(e) =>
                  setServerConfig({ ...serverConfig, motd: e.target.value })
                }
                placeholder="Message of the Day"
              />
            </SettingRow>

            <SettingRow>
              <SettingLabel>Max Users</SettingLabel>
              <Input
                type="number"
                min="1"
                max="100"
                value={serverConfig.maxUsers}
                onChange={(e) =>
                  setServerConfig({
                    ...serverConfig,
                    maxUsers: parseInt(e.target.value) || 50,
                  })
                }
              />
            </SettingRow>

            <SettingRow>
              <SettingLabel>Port</SettingLabel>
              <Input
                type="number"
                min="1000"
                max="65535"
                value={serverConfig.port}
                onChange={(e) =>
                  setServerConfig({
                    ...serverConfig,
                    port: parseInt(e.target.value) || 27890,
                  })
                }
              />
            </SettingRow>
          </SettingsSection>

          <SettingsSection>
            <SectionTitle>🔐 Security</SectionTitle>

            <SettingRow>
              <SettingLabel>Require Password</SettingLabel>
              <DeviceSelect
                value={serverConfig.requirePassword ? "true" : "false"}
                onChange={(e) =>
                  setServerConfig({
                    ...serverConfig,
                    requirePassword: e.target.value === "true",
                  })
                }
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </DeviceSelect>
            </SettingRow>

            {serverConfig.requirePassword && (
              <SettingRow>
                <SettingLabel>Server Password</SettingLabel>
                <Input
                  type="password"
                  value={serverConfig.password}
                  onChange={(e) =>
                    setServerConfig({
                      ...serverConfig,
                      password: e.target.value,
                    })
                  }
                  placeholder="Enter server password"
                />
              </SettingRow>
            )}
          </SettingsSection>

          <SettingsSection
            style={{
              borderTop: "1px solid #444",
              paddingTop: "16px",
              marginTop: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <AudioTestButton onClick={() => setShowServerSettings(false)}>
                ❌ Cancel
              </AudioTestButton>
              <AudioTestButton
                onClick={saveServerConfig}
                style={{ background: "#2a5a2a", borderColor: "#00ff00" }}
              >
                ✅ Save Config
              </AudioTestButton>
            </div>

            <TestStatus style={{ marginTop: "8px", textAlign: "center" }}>
              💡 Note: Server must be restarted to apply configuration changes
            </TestStatus>
          </SettingsSection>
        </SettingsModal>
      </SettingsOverlay>

      {/* Icon Picker Modal */}
      {showIconPicker && (
        <SettingsOverlay show={true} onClick={() => setShowIconPicker(null)}>
          <SettingsModal
            onClick={(e) => e.stopPropagation()}
            style={{ minWidth: "300px" }}
          >
            <SettingsHeader>
              <SettingsTitle>🎨 Choose Channel Icon</SettingsTitle>
              <CloseButton onClick={() => setShowIconPicker(null)}>
                <FaTimes />
              </CloseButton>
            </SettingsHeader>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "8px",
                padding: "16px 0",
              }}
            >
              {availableIcons.map((icon) => (
                <button
                  key={icon}
                  onClick={() => {
                    saveChannelIcon(showIconPicker, icon);
                    setShowIconPicker(null);
                  }}
                  style={{
                    background:
                      channelIcons.get(showIconPicker) === icon
                        ? "#3a5998"
                        : "#2a2a2a",
                    border:
                      channelIcons.get(showIconPicker) === icon
                        ? "2px solid #4a69a8"
                        : "1px solid #404040",
                    borderRadius: "8px",
                    padding: "12px",
                    fontSize: "24px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </SettingsModal>
        </SettingsOverlay>
      )}
    </Container>
  );
};

export default ChannelTree;
