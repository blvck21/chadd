import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { io } from "socket.io-client";
import ChannelTree from "./components/ChannelTree";
import Chat from "./components/Chat";
import ServerBrowser from "./components/ServerBrowser";
import VoiceManager from "./components/VoiceManager";
import { useVoiceStore } from "./stores/voiceStore";
import { ThemeProvider } from "./contexts/ThemeContext";
import {
  FaServer,
  FaSignOutAlt,
  FaPlug,
  FaWifi,
  FaDownload,
} from "react-icons/fa";
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";

interface UpdateInfo {
  available: boolean;
  current_version: string;
  latest_version: string;
  download_url?: string;
  release_notes?: string;
  error?: string;
  asset_size?: number;
}

interface DownloadProgress {
  downloaded: number;
  total: number;
  percentage: number;
  status: string;
}

const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-background);
  color: var(--color-text-primary);
  font-family: var(--font-primary);
  position: relative;
`;

const TopBar = styled.div`
  height: 40px;
  background: var(--color-secondary);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 1000;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const AppTitle = styled.div`
  font-weight: bold;
  color: var(--color-accent);
  font-size: 14px;
`;

const ConnectionStatus = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "connected",
})<{ connected: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${(props) => (props.connected ? "#90ee90" : "#ff6b6b")};
`;

const ServerInfo = styled.div`
  font-size: 12px;
  color: var(--color-text-secondary);
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TopBarButton = styled.button`
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    background: var(--color-surface);
    border-color: var(--color-accent);
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
`;

const Overlay = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "show",
})<{ show: boolean }>`
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

const DisconnectedOverlay = styled(Overlay)`
  background: rgba(0, 0, 0, 0.9);
`;

const ReconnectCard = styled.div`
  background: var(--color-secondary);
  border: 2px solid var(--color-border);
  border-radius: 12px;
  padding: 24px;
  min-width: 300px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
`;

const ReconnectTitle = styled.h2`
  color: var(--color-accent);
  margin: 0 0 16px 0;
  font-size: 18px;
`;

const ReconnectMessage = styled.p`
  color: var(--color-text-primary);
  margin: 0 0 20px 0;
`;

const Button = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== "variant",
})<{ variant?: "primary" | "secondary" | "danger" }>`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  margin: 0 8px;
  transition: all 0.2s;

  ${(props) => {
    if (props.variant === "primary") {
      return `
        background: var(--color-accent);
        color: #000;
        &:hover { background: var(--color-accent-hover); }
      `;
    } else if (props.variant === "danger") {
      return `
        background: #ff6b6b;
        color: white;
        &:hover { background: #ff8a8a; }
      `;
    } else {
      return `
        background: var(--color-surface);
        color: var(--color-text-primary);
        &:hover { background: var(--color-tertiary); }
      `;
    }
  }}
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  font-size: 16px;
  text-align: center;
  gap: 16px;
  position: relative;
  overflow: hidden;
`;

const MatrixContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.1;
  z-index: 0;
`;

const MatrixCanvas = styled.canvas`
  width: 100%;
  height: 100%;
`;

const WelcomeContent = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;

const CHADDAscii = styled.pre`
  font-family: "Courier New", monospace;
  color: var(--color-accent);
  font-size: 12px;
  line-height: 1;
  text-shadow: 0 0 10px var(--color-accent);
  animation: glow 2s ease-in-out infinite alternate;
  margin: 0;

  @keyframes glow {
    from {
      text-shadow: 0 0 5px var(--color-accent), 0 0 10px var(--color-accent);
      filter: brightness(1);
    }
    to {
      text-shadow: 0 0 10px var(--color-accent), 0 0 20px var(--color-accent),
        0 0 30px var(--color-accent);
      filter: brightness(1.2);
    }
  }
`;

const WelcomeText = styled.div`
  font-size: 24px;
  color: var(--color-accent);
  text-shadow: 0 0 10px var(--color-accent);
  margin-bottom: 8px;
`;

const SubText = styled.div`
  font-size: 14px;
  color: var(--color-text-secondary);
  opacity: 0.7;
`;

const ConnectButton = styled(Button)`
  /* No animations - instant appearance */
`;

const ProgressContainer = styled.div`
  margin: 16px 0;
  width: 100%;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--color-text-secondary);
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background: var(--color-surface);
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressBar = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "percentage",
})<{ percentage: number }>`
  width: ${(props) => props.percentage}%;
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), #00ff88);
  transition: width 0.3s ease;
  border-radius: 4px;
`;

const UpdateStatus = styled.div`
  margin: 12px 0;
  padding: 12px;
  background: var(--color-surface);
  border-radius: 6px;
  font-size: 13px;
  color: var(--color-text-primary);
  text-align: center;
`;

const UpdateNotification = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "show",
})<{ show: boolean }>`
  position: fixed;
  top: 50px;
  right: 20px;
  background: var(--color-secondary);
  border: 2px solid var(--color-accent);
  border-radius: 8px;
  padding: 16px;
  min-width: 300px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  transform: translateX(${(props) => (props.show ? "0" : "350px")});
  transition: transform 0.3s ease;
  cursor: pointer;

  &:hover {
    background: var(--color-surface);
  }
`;

const NotificationTitle = styled.div`
  color: var(--color-accent);
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NotificationMessage = styled.div`
  color: var(--color-text-primary);
  font-size: 12px;
  line-height: 1.4;
`;

const NotificationClose = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 16px;
  padding: 4px;

  &:hover {
    color: var(--color-text-primary);
  }
`;

const VersionDisplay = styled.div`
  position: fixed;
  bottom: 8px;
  right: 8px;
  font-size: 10px;
  color: var(--color-text-secondary);
  background: var(--color-surface);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  opacity: 0.7;
  z-index: 1000;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;

  &:hover {
    opacity: 1;
    background: var(--color-tertiary);
    border-color: var(--color-accent);
  }
`;

// Matrix Animation Component
const MatrixAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Matrix characters (including some CHADD letters)
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()CHADD".split(
      ""
    );
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = [];

    // Initialize drops
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    const draw = () => {
      // Black background with slight transparency for trailing effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Green text
      ctx.fillStyle = "#00ff00";
      ctx.font = `${fontSize}px 'Courier New', monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Random character
        const char = chars[Math.floor(Math.random() * chars.length)];

        // Draw character
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        // Reset drop randomly
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return <MatrixCanvas ref={canvasRef} />;
};

function App() {
  console.log("App component rendering...");

  const [isLoading, setIsLoading] = useState(true);

  const {
    socket,
    setSocket,
    isConnected,
    setIsConnected,
    currentRoom,
    setUsername,
    serverInfo,
    setServerInfo,
    setServerConnection,
    disconnect,
    setCurrentUser,
  } = useVoiceStore();

  // Simple loading check to ensure DOM is ready
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      console.log("App initialization complete");
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const [showServerBrowser, setShowServerBrowser] = useState(false);
  const [currentServerHost, setCurrentServerHost] = useState<string>("");
  const [currentServerPort, setCurrentServerPort] = useState<number>(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showReconnectDialog, setShowReconnectDialog] = useState(false);
  const [appVersion, setAppVersion] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] =
    useState<DownloadProgress | null>(null);
  const [silentUpdateInfo, setSilentUpdateInfo] = useState<UpdateInfo | null>(
    null
  );
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);

  // Check if we need to show reconnect dialog
  useEffect(() => {
    if (!isConnected && currentRoom && currentServerHost) {
      setShowReconnectDialog(true);
    } else {
      setShowReconnectDialog(false);
    }
  }, [isConnected, currentRoom, currentServerHost]);

  // Load app version and check for updates
  useEffect(() => {
    const loadVersion = async () => {
      try {
        const version = await invoke("get_app_version");
        setAppVersion(version as string);
      } catch (error) {
        console.error("Failed to load app version:", error);
        setAppVersion("Unknown");
      }
    };

    const checkForUpdatesOnStartup = async () => {
      try {
        // Wait a few seconds after startup to avoid interfering with initialization
        setTimeout(async () => {
          const result = (await invoke(
            "check_for_updates_silent"
          )) as UpdateInfo;
          setSilentUpdateInfo(result);

          if (result.available) {
            console.log("Update available on startup:", result);
            setShowUpdateNotification(true);
          }
        }, 3000); // Check after 3 seconds
      } catch (error) {
        console.error("Silent update check failed:", error);
      }
    };

    loadVersion();
    checkForUpdatesOnStartup();

    // Listen for download progress events
    const setupProgressListener = async () => {
      await listen<DownloadProgress>("download-progress", (event) => {
        setDownloadProgress(event.payload);
      });
    };

    setupProgressListener();
  }, []);

  const handleCheckForUpdates = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      const result = (await invoke("check_for_updates")) as UpdateInfo;
      console.log("Update check result:", result);
      setUpdateInfo(result);

      if (result.available) {
        console.log("Update available, showing dialog");
        setShowUpdateDialog(true);
      } else if (result.error) {
        console.log("Update check failed with error:", result.error);
        alert(`Update check failed: ${result.error}`);
      } else {
        console.log("No update available, showing up-to-date message");
        alert(`You're running the latest version (${result.current_version})`);
      }
    } catch (error) {
      console.error("Failed to check for updates:", error);
      alert("Failed to check for updates. Please try again later.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadUpdate = async () => {
    if (!updateInfo?.download_url || isDownloading) return;

    setIsDownloading(true);
    setDownloadProgress({
      downloaded: 0,
      total: updateInfo.asset_size || 0,
      percentage: 0,
      status: "Starting download...",
    });

    try {
      await invoke("download_and_install_update", {
        downloadUrl: updateInfo.download_url,
      });
    } catch (error) {
      console.error("Update download failed:", error);
      alert(`Update download failed: ${error}`);
      setIsDownloading(false);
      setDownloadProgress(null);
    }
  };

  const handleShowUpdateFromNotification = () => {
    if (silentUpdateInfo) {
      setUpdateInfo(silentUpdateInfo);
      setShowUpdateDialog(true);
      setShowUpdateNotification(false);
    }
  };

  const connectToServer = async (
    host: string,
    port: number,
    password?: string,
    connectUsername?: string
  ) => {
    try {
      setConnectionError(null);
      setShowServerBrowser(false);

      // Disconnect from previous server if connected
      if (socket && isConnected) {
        disconnect();
      }

      // Use HTTP protocol for both API and WebSocket connections
      const protocol = "http";
      // Use IP address for better certificate handling in Tauri
      const serverHost = host === "localhost" ? "127.0.0.1" : host;
      const socketUrl = `${protocol}://${serverHost}:${port}`;

      console.log(`Connecting to: ${socketUrl}`);

      // Create new socket connection with HTTP settings
      const newSocket = io(socketUrl, {
        transports: ["websocket", "polling"],
        timeout: 20000,
        forceNew: true,
        upgrade: true,
        secure: false, // Use HTTP/WS instead of HTTPS/WSS
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
      });

      // Set up basic connection handlers
      newSocket.on("connect", () => {
        console.log("Connected to server");

        // Set username if provided
        if (connectUsername) {
          setUsername(connectUsername);
        }

        // Set up the socket in voice store (this will set up all event listeners)
        setSocket(newSocket);
        setCurrentServerHost(host);
        setCurrentServerPort(port);

        // Store server connection details in voice store for API calls
        setServerConnection(host, port);

        console.log("Connection established successfully");

        // Authenticate if password is required
        if (password) {
          newSocket.emit("authenticate", { password }, (response: any) => {
            if (!response.success) {
              setConnectionError(response.error || "Authentication failed");
              disconnect();
            } else {
              setServerInfo(response.serverInfo);
              console.log("Authenticated successfully", response.serverInfo);
              console.log("connectUsername provided:", connectUsername);

              // Join as user with username after authentication
              if (connectUsername) {
                console.log(
                  "Emitting join-as-user with username:",
                  connectUsername
                );

                // Set a timeout fallback in case server doesn't respond
                const timeoutId = setTimeout(() => {
                  console.log(
                    "join-as-user timeout, setting isConnected anyway"
                  );
                  setIsConnected(true);
                }, 3000);

                newSocket.emit(
                  "join-as-user",
                  { username: connectUsername },
                  (userResponse: any) => {
                    clearTimeout(timeoutId);
                    console.log("Join user response:", userResponse);
                    if (userResponse?.success && userResponse?.user) {
                      setCurrentUser(userResponse.user);
                      console.log(
                        "User registered successfully:",
                        userResponse.user
                      );
                    } else {
                      console.error(
                        "Failed to register user:",
                        userResponse?.error
                      );
                    }
                    // Always set connected, even if user registration fails
                    console.log("Setting isConnected to true");
                    setIsConnected(true);
                  }
                );
              } else {
                console.log(
                  "No connectUsername provided, setting isConnected directly"
                );
                setIsConnected(true);
              }
            }
          });
        } else {
          // Get server info without authentication
          newSocket.emit("get-server-info", (serverInfo: any) => {
            setServerInfo(serverInfo);
            console.log("Got server info", serverInfo);
            console.log("connectUsername provided:", connectUsername);

            // Join as user with username after getting server info
            if (connectUsername) {
              console.log(
                "Emitting join-as-user with username:",
                connectUsername
              );

              // Set a timeout fallback in case server doesn't respond
              const timeoutId = setTimeout(() => {
                console.log("join-as-user timeout, setting isConnected anyway");
                setIsConnected(true);
              }, 5000);

              newSocket.emit(
                "join-as-user",
                { username: connectUsername },
                (userResponse: any) => {
                  clearTimeout(timeoutId);
                  console.log("Join user response:", userResponse);
                  if (userResponse?.success && userResponse?.user) {
                    setCurrentUser(userResponse.user);
                    console.log(
                      "User registered successfully:",
                      userResponse.user
                    );
                  } else {
                    console.error(
                      "Failed to register user:",
                      userResponse?.error
                    );
                  }
                  // Always set connected, even if user registration fails
                  console.log("Setting isConnected to true");
                  setIsConnected(true);
                }
              );
            } else {
              console.log(
                "No connectUsername provided, setting isConnected directly"
              );
              setIsConnected(true);
            }
          });
        }
      });

      newSocket.on("connect_error", (error: any) => {
        console.error("Connection failed:", error);
        setConnectionError(
          "Failed to connect to server. Please check the address and port."
        );
        setIsConnected(false);
      });

      newSocket.on("disconnect", (reason: any) => {
        console.log("Disconnected from server:", reason);
        setIsConnected(false);
        if (reason === "io server disconnect") {
          // Server disconnected us, show reconnect dialog
          setShowReconnectDialog(true);
        }
      });

      newSocket.on("error", (error: any) => {
        console.error("Socket error:", error);
        setConnectionError(error.message || "Connection error occurred");
      });
    } catch (error) {
      console.error("Failed to connect:", error);
      setConnectionError("Failed to establish connection");
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setCurrentServerHost("");
    setCurrentServerPort(0);
    setShowReconnectDialog(false);
  };

  const handleReconnect = () => {
    if (currentServerHost && currentServerPort) {
      connectToServer(currentServerHost, currentServerPort);
    }
    setShowReconnectDialog(false);
  };

  const renderMainContent = () => {
    if (!isConnected) {
      const chaddAscii = `
 ██████╗██╗  ██╗ █████╗ ██████╗ ██████╗ 
██╔════╝██║  ██║██╔══██╗██╔══██╗██╔══██╗
██║     ███████║███████║██║  ██║██║  ██║
██║     ██╔══██║██╔══██║██║  ██║██║  ██║
╚██████╗██║  ██║██║  ██║██████╔╝██████╔╝
 ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚═════╝ 

    ═══════════════════════════════════════
    ║      VOICE COMMUNICATION CLIENT     ║
    ═══════════════════════════════════════

    [STATUS: READY] [VOICE: ENABLED]`;

      return (
        <EmptyState>
          <MatrixContainer>
            <MatrixAnimation />
          </MatrixContainer>

          <WelcomeContent>
            <CHADDAscii>{chaddAscii}</CHADDAscii>

            <WelcomeText>Welcome to CHADD</WelcomeText>

            <SubText>
              Voice Communication Client
              <br />
              Secure • Reliable • Fast
            </SubText>

            <ConnectButton
              variant="primary"
              onClick={() => setShowServerBrowser(true)}
            >
              <FaServer /> Connect to Server
            </ConnectButton>
          </WelcomeContent>
        </EmptyState>
      );
    }

    return (
      <>
        <ChannelTree />
        <Chat />
      </>
    );
  };

  // Show simple loading screen while initializing
  if (isLoading) {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          background: "#1a1a1a",
          color: "#00ff00",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: '"Courier New", monospace',
          fontSize: "16px",
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: "20px" }}>Loading CHADD...</div>
        <div style={{ fontSize: "12px", opacity: 0.7 }}>
          {">> Loading interface"}
          <br />
          {">> Preparing voice systems"}
          <br />
          {">> Ready"}
        </div>
      </div>
    );
  }

  return (
    <AppContainer>
      <TopBar>
        <LeftSection>
          <AppTitle>CHADD</AppTitle>
          <ConnectionStatus connected={isConnected}>
            {isConnected ? <FaWifi /> : <FaPlug />}
            {isConnected ? "Connected" : "Disconnected"}
          </ConnectionStatus>
          {isConnected && serverInfo && (
            <ServerInfo>
              {serverInfo.name} ({currentServerHost}:{currentServerPort})
            </ServerInfo>
          )}
        </LeftSection>

        <RightSection>
          <TopBarButton onClick={() => setShowServerBrowser(true)}>
            <FaServer /> Servers
          </TopBarButton>
          <TopBarButton
            onClick={handleCheckForUpdates}
            disabled={isUpdating}
            style={{
              color: silentUpdateInfo?.available
                ? "var(--color-accent)"
                : "inherit",
              borderColor: silentUpdateInfo?.available
                ? "var(--color-accent)"
                : "var(--color-border)",
            }}
          >
            <FaDownload />
            {isUpdating
              ? "Checking..."
              : silentUpdateInfo?.available
              ? "Update!"
              : "Updates"}
          </TopBarButton>
          {isConnected && (
            <TopBarButton onClick={handleDisconnect}>
              <FaSignOutAlt /> Disconnect
            </TopBarButton>
          )}
        </RightSection>
      </TopBar>

      <MainContent>{renderMainContent()}</MainContent>

      <VoiceManager />

      {/* Server Browser Modal */}
      <Overlay
        show={showServerBrowser}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowServerBrowser(false);
          }
        }}
      >
        <ServerBrowser
          onConnect={connectToServer}
          onClose={() => setShowServerBrowser(false)}
        />
      </Overlay>

      {/* Connection Error Modal */}
      {connectionError && (
        <DisconnectedOverlay show={true}>
          <ReconnectCard>
            <ReconnectTitle>❌ Connection Error</ReconnectTitle>
            <ReconnectMessage>{connectionError}</ReconnectMessage>
            <Button variant="primary" onClick={() => setConnectionError(null)}>
              OK
            </Button>
          </ReconnectCard>
        </DisconnectedOverlay>
      )}

      {/* Reconnect Dialog */}
      {showReconnectDialog && (
        <DisconnectedOverlay show={true}>
          <ReconnectCard>
            <ReconnectTitle>🔌 Connection Lost</ReconnectTitle>
            <ReconnectMessage>
              Lost connection to {currentServerHost}:{currentServerPort}
            </ReconnectMessage>
            <Button variant="primary" onClick={handleReconnect}>
              🔄 Reconnect
            </Button>
            <Button variant="secondary" onClick={handleDisconnect}>
              🏠 Server Browser
            </Button>
          </ReconnectCard>
        </DisconnectedOverlay>
      )}

      {/* Update Dialog */}
      {showUpdateDialog && updateInfo && (
        <DisconnectedOverlay show={true}>
          <ReconnectCard>
            <ReconnectTitle>
              {isDownloading ? "🔄 Installing Update" : "🚀 Update Available"}
            </ReconnectTitle>
            <ReconnectMessage>
              {isDownloading ? (
                <>
                  <UpdateStatus>
                    {downloadProgress?.status || "Preparing update..."}
                  </UpdateStatus>
                  <ProgressContainer>
                    <ProgressLabel>
                      <span>
                        {downloadProgress
                          ? `${(
                              downloadProgress.downloaded /
                              1024 /
                              1024
                            ).toFixed(1)} MB`
                          : "0 MB"}
                      </span>
                      <span>
                        {downloadProgress
                          ? `${(downloadProgress.total / 1024 / 1024).toFixed(
                              1
                            )} MB`
                          : updateInfo.asset_size
                          ? `${(updateInfo.asset_size / 1024 / 1024).toFixed(
                              1
                            )} MB`
                          : "Unknown size"}
                      </span>
                    </ProgressLabel>
                    <ProgressBarContainer>
                      <ProgressBar
                        percentage={downloadProgress?.percentage || 0}
                      />
                    </ProgressBarContainer>
                    <div
                      style={{
                        textAlign: "center",
                        marginTop: "8px",
                        fontSize: "14px",
                      }}
                    >
                      {downloadProgress?.percentage.toFixed(1) || 0}%
                    </div>
                  </ProgressContainer>
                </>
              ) : (
                <>
                  A new version is available!
                  <br />
                  Current: v{updateInfo.current_version}
                  <br />
                  Latest: v{updateInfo.latest_version}
                  {updateInfo.asset_size && (
                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "12px",
                        opacity: 0.7,
                      }}
                    >
                      Download size:{" "}
                      {(updateInfo.asset_size / 1024 / 1024).toFixed(1)} MB
                    </div>
                  )}
                  {updateInfo.release_notes && (
                    <div
                      style={{
                        marginTop: "12px",
                        fontSize: "12px",
                        opacity: 0.8,
                      }}
                    >
                      {updateInfo.release_notes.substring(0, 200)}
                      {updateInfo.release_notes.length > 200 && "..."}
                    </div>
                  )}
                </>
              )}
            </ReconnectMessage>
            {!isDownloading ? (
              <>
                <Button
                  variant="primary"
                  onClick={handleDownloadUpdate}
                  disabled={!updateInfo.download_url}
                >
                  🚀 Install Update
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowUpdateDialog(false)}
                >
                  Later
                </Button>
              </>
            ) : (
              <Button variant="secondary" disabled>
                Installing... Please wait
              </Button>
            )}
          </ReconnectCard>
        </DisconnectedOverlay>
      )}

      {/* Update Notification */}
      {showUpdateNotification && silentUpdateInfo && (
        <UpdateNotification
          show={showUpdateNotification}
          onClick={handleShowUpdateFromNotification}
        >
          <NotificationClose
            onClick={(e) => {
              e.stopPropagation();
              setShowUpdateNotification(false);
            }}
          >
            ✕
          </NotificationClose>
          <NotificationTitle>🚀 Update Available</NotificationTitle>
          <NotificationMessage>
            Version {silentUpdateInfo.latest_version} is now available!
            <br />
            Click to install the update.
          </NotificationMessage>
        </UpdateNotification>
      )}

      {/* Version Display */}
      <VersionDisplay
        onClick={handleCheckForUpdates}
        title="Click to check for updates"
      >
        v{appVersion} {isUpdating && "(Checking...)"}
      </VersionDisplay>
    </AppContainer>
  );
}

const AppWithTheme = () => (
  <ThemeProvider>
    <App />
  </ThemeProvider>
);

export default AppWithTheme;
