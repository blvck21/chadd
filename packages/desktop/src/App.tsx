import { useState, useEffect } from "react";
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

interface UpdateInfo {
  available: boolean;
  current_version: string;
  latest_version: string;
  download_url?: string;
  release_notes?: string;
  error?: string;
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
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  opacity: 0.5;
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

function App() {
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

  const [showServerBrowser, setShowServerBrowser] = useState(false);
  const [currentServerHost, setCurrentServerHost] = useState<string>("");
  const [currentServerPort, setCurrentServerPort] = useState<number>(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showReconnectDialog, setShowReconnectDialog] = useState(false);
  const [appVersion, setAppVersion] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

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

    loadVersion();
  }, []);

  const handleCheckForUpdates = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      const result = (await invoke("check_for_updates")) as UpdateInfo;
      setUpdateInfo(result);

      if (result.available) {
        setShowUpdateDialog(true);
      } else if (result.error) {
        alert(`Update check failed: ${result.error}`);
      } else {
        alert(`You're running the latest version (${result.current_version})`);
      }
    } catch (error) {
      console.error("Failed to check for updates:", error);
      alert("Failed to check for updates. Please try again later.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadUpdate = () => {
    if (updateInfo?.download_url) {
      window.open(updateInfo.download_url, "_blank");
      setShowUpdateDialog(false);
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

      // Create new socket connection
      const newSocket = io(`http://${host}:${port}`, {
        transports: ["websocket", "polling"],
        timeout: 10000,
        forceNew: true,
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
      return (
        <EmptyState>
          <EmptyIcon>🏠</EmptyIcon>
          <div>Welcome to IchFickDiscord</div>
          <div style={{ fontSize: "14px", opacity: 0.7 }}>
            Connect to a server to start chatting with friends
          </div>
          <Button variant="primary" onClick={() => setShowServerBrowser(true)}>
            <FaServer /> Connect to Server
          </Button>
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

  return (
    <AppContainer>
      <TopBar>
        <LeftSection>
          <AppTitle>IchFickDiscord</AppTitle>
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
          <TopBarButton onClick={handleCheckForUpdates} disabled={isUpdating}>
            <FaDownload />
            {isUpdating ? "Checking..." : "Updates"}
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
            <ReconnectTitle>🚀 Update Available</ReconnectTitle>
            <ReconnectMessage>
              A new version is available!
              <br />
              Current: v{updateInfo.current_version}
              <br />
              Latest: v{updateInfo.latest_version}
              {updateInfo.release_notes && (
                <div
                  style={{ marginTop: "12px", fontSize: "12px", opacity: 0.8 }}
                >
                  {updateInfo.release_notes.substring(0, 200)}
                  {updateInfo.release_notes.length > 200 && "..."}
                </div>
              )}
            </ReconnectMessage>
            <Button variant="primary" onClick={handleDownloadUpdate}>
              📥 Download Update
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowUpdateDialog(false)}
            >
              Later
            </Button>
          </ReconnectCard>
        </DisconnectedOverlay>
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
