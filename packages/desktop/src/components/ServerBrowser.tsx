import { useState, useEffect } from "react";
import styled from "styled-components";

interface ServerInfo {
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

interface ServerListItem extends ServerInfo {
  host: string;
  port: number;
  ping: number;
  isOnline: boolean;
  lastSeen?: Date;
}

interface Props {
  onConnect: (
    host: string,
    port: number,
    password?: string,
    username?: string
  ) => void;
  onClose?: () => void;
}

const Container = styled.div<{ $themeType?: string }>`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  max-width: 1200px;
  max-height: 900px;
  background: #1a1a1a;
  color: #00ff00;
  font-family: "Courier New", monospace;
  position: relative;
  border: 2px solid #00ff00;
  margin: auto;

  /* Responsive sizing */
  @media (max-width: 1200px) {
    width: 95vw;
    height: 95vh;
  }

  @media (max-width: 768px) {
    width: 100vw;
    height: 100vh;
    border: 1px solid #00ff00;
  }

  @media (max-width: 480px) {
    border: none;
    border-top: 2px solid #00ff00;
    border-bottom: 2px solid #00ff00;
  }

  /* Retro terminal scanlines effect */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0, 255, 0, 0.03) 2px,
      rgba(0, 255, 0, 0.03) 4px
    );
    pointer-events: none;
    z-index: 1;
  }

  /* Terminal flicker effect */
  animation: flicker 0.15s infinite linear;

  @keyframes flicker {
    0% {
      opacity: 1;
    }
    98% {
      opacity: 1;
    }
    99% {
      opacity: 0.98;
    }
    100% {
      opacity: 1;
    }
  }
`;

const Header = styled.div`
  background: #000;
  padding: 16px;
  border-bottom: 2px solid #00ff00;
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: 768px) {
    padding: 12px;
    flex-direction: column;
    align-items: flex-start;
  }

  @media (max-width: 480px) {
    padding: 8px;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    align-self: flex-end;
    position: absolute;
    top: 12px;
    right: 12px;
  }

  @media (max-width: 480px) {
    top: 8px;
    right: 8px;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: 1px solid #ff0000;
  color: #ff0000;
  padding: 4px 8px;
  font-family: "Courier New", monospace;
  font-size: 12px;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 0, 0, 0.1);
    box-shadow: 0 0 8px #ff0000;
  }

  @media (max-width: 480px) {
    padding: 2px 6px;
    font-size: 10px;
  }
`;

const Title = styled.h1`
  margin: 0;
  color: #00ff00;
  font-size: 20px;
  font-weight: normal;
  font-family: "Courier New", monospace;
  text-shadow: 0 0 10px #00ff00;

  @media (max-width: 768px) {
    font-size: 18px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
  }

  &::before {
    content: "> ";
    color: #ffff00;
  }
`;

const Subtitle = styled.p`
  margin: 4px 0 0 0;
  color: #888;
  font-size: 12px;
  font-family: "Courier New", monospace;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 16px;
  z-index: 2;
  position: relative;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 12px;
    gap: 12px;
  }

  @media (max-width: 480px) {
    padding: 8px;
    gap: 8px;
  }
`;

const Section = styled.div`
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #00ff00;
  padding: 12px;
  font-family: "Courier New", monospace;
`;

const SectionTitle = styled.h2`
  margin: 0 0 12px 0;
  color: #ffff00;
  font-size: 14px;
  font-weight: normal;
  font-family: "Courier New", monospace;
  text-transform: uppercase;

  &::before {
    content: "[";
    color: #00ff00;
  }

  &::after {
    content: "]";
    color: #00ff00;
  }
`;

const ConnectForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
  }
`;

const Label = styled.label`
  color: #00ff00;
  font-family: "Courier New", monospace;
  min-width: 80px;
  font-size: 12px;

  @media (max-width: 480px) {
    min-width: unset;
    font-size: 11px;
  }

  &::after {
    content: ":";
  }
`;

const Input = styled.input`
  flex: 1;
  padding: 4px 8px;
  background: #000;
  border: 1px solid #00ff00;
  color: #00ff00;
  font-size: 12px;
  font-family: "Courier New", monospace;

  &:focus {
    outline: none;
    box-shadow: 0 0 8px #00ff00;
    background: rgba(0, 255, 0, 0.05);
  }

  &::placeholder {
    color: #444;
  }
`;

const Button = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== "variant",
})<{ variant?: "primary" | "secondary" | "danger" }>`
  padding: 6px 12px;
  border: 1px solid;
  background: transparent;
  font-family: "Courier New", monospace;
  font-size: 12px;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.2s ease;

  ${(props) =>
    props.variant === "primary" &&
    `
    border-color: #00ff00;
    color: #00ff00;
    
    &:hover {
      background: rgba(0, 255, 0, 0.1);
      box-shadow: 0 0 8px #00ff00;
    }
  `}

  ${(props) =>
    props.variant === "secondary" &&
    `
    border-color: #ffff00;
    color: #ffff00;
    
    &:hover {
      background: rgba(255, 255, 0, 0.1);
      box-shadow: 0 0 8px #ffff00;
    }
  `}
  
  ${(props) =>
    props.variant === "danger" &&
    `
    border-color: #ff0000;
    color: #ff0000;
    
    &:hover {
      background: rgba(255, 0, 0, 0.1);
      box-shadow: 0 0 8px #ff0000;
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ServerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #444;
  background: #000;

  @media (max-width: 768px) {
    max-height: 250px;
  }

  @media (max-width: 480px) {
    max-height: 200px;
  }

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #000;
  }

  &::-webkit-scrollbar-thumb {
    background: #00ff00;

    &:hover {
      background: #ffff00;
    }
  }
`;

const ServerItem = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "isOnline",
})<{ isOnline: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: rgba(0, 255, 0, 0.02);
  border-bottom: 1px solid #333;
  cursor: pointer;
  font-family: "Courier New", monospace;
  font-size: 11px;

  &:hover {
    background: rgba(0, 255, 0, 0.05);
  }

  &::before {
    content: "${(props) => (props.isOnline ? "●" : "○")}";
    color: ${(props) => (props.isOnline ? "#00ff00" : "#ff0000")};
    margin-right: 8px;
  }
`;

const ServerInfo = styled.div`
  flex: 1;
`;

const ServerName = styled.div`
  font-weight: normal;
  font-size: 12px;
  color: #00ff00;
  margin-bottom: 2px;
  font-family: "Courier New", monospace;
`;

const ServerDetails = styled.div`
  font-size: 10px;
  color: #888;
  display: flex;
  gap: 8px;
  font-family: "Courier New", monospace;
`;

const ServerStatus = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "isOnline",
})<{ isOnline: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
`;

const StatusBadge = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== "isOnline",
})<{ isOnline: boolean }>`
  padding: 2px 6px;
  font-size: 10px;
  font-family: "Courier New", monospace;
  text-transform: uppercase;
  border: 1px solid;
  background: transparent;

  ${(props) =>
    props.isOnline
      ? `
    color: #00ff00;
    border-color: #00ff00;
  `
      : `
    color: #ff0000;
    border-color: #ff0000;
  `}
`;

const Ping = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== "ping",
})<{ ping: number }>`
  font-size: 10px;
  font-family: "Courier New", monospace;

  ${(props) => {
    if (props.ping < 50) return "color: #00ff00;";
    if (props.ping < 100) return "color: #ffff00;";
    return "color: #ff0000;";
  }}
`;

const QuickConnect = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-end;
`;

const PasswordModal = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "show",
})<{ show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: ${(props) => (props.show ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

const ModalContent = styled.div`
  background: #000;
  padding: 20px;
  border: 2px solid #00ff00;
  font-family: "Courier New", monospace;
  text-align: center;
  min-width: 300px;
`;

const ModalTitle = styled.h3`
  margin: 0 0 16px 0;
  color: #00ff00;
  font-size: 14px;
  font-family: "Courier New", monospace;
  text-transform: uppercase;
`;

export default function ServerBrowser({ onConnect, onClose }: Props) {
  const [host, setHost] = useState("localhost");
  const [port, setPort] = useState("27890");
  const [username, setUsername] = useState(
    localStorage.getItem("CHADD-username") || ""
  );
  const [password, setPassword] = useState("");
  const [servers, setServers] = useState<ServerListItem[]>([]);
  const [connecting, setConnecting] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedServer, setSelectedServer] = useState<ServerListItem | null>(
    null
  );

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onClose) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // Load saved servers
  useEffect(() => {
    const savedServers = localStorage.getItem("CHADD-servers");
    if (savedServers) {
      try {
        const parsed = JSON.parse(savedServers);
        setServers(parsed);
        // Ping servers to check status
        pingServers(parsed);
      } catch (error) {
        console.error("Failed to load saved servers:", error);
      }
    }
  }, []);

  const pingServers = async (serverList: ServerListItem[]) => {
    const updatedServers = await Promise.all(
      serverList.map(async (server) => {
        try {
          const startTime = Date.now();
          const response = await fetch(
            `http://${server.host}:${server.port}/api/server-info`,
            {
              method: "GET",
              signal: AbortSignal.timeout(5000),
            }
          );

          if (response.ok) {
            const serverInfo = await response.json();
            const ping = Date.now() - startTime;

            return {
              ...server,
              ...serverInfo,
              ping,
              isOnline: true,
              lastSeen: new Date(),
            };
          }
        } catch (error) {
          // Server is offline
        }

        return {
          ...server,
          isOnline: false,
          ping: 9999,
        };
      })
    );

    setServers(updatedServers);
  };

  const saveServers = (serverList: ServerListItem[]) => {
    localStorage.setItem("CHADD-servers", JSON.stringify(serverList));
  };

  const addServer = async () => {
    if (!host || !port) return;

    setConnecting(true);

    try {
      const startTime = Date.now();
      const response = await fetch(`http://${host}:${port}/api/server-info`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const serverInfo = await response.json();
        const ping = Date.now() - startTime;

        const newServer: ServerListItem = {
          ...serverInfo,
          host,
          port: parseInt(port),
          ping,
          isOnline: true,
          lastSeen: new Date(),
        };

        // Check if server already exists
        const existingIndex = servers.findIndex(
          (s) => s.host === host && s.port === parseInt(port)
        );
        let updatedServers;

        if (existingIndex >= 0) {
          updatedServers = [...servers];
          updatedServers[existingIndex] = newServer;
        } else {
          updatedServers = [...servers, newServer];
        }

        setServers(updatedServers);
        saveServers(updatedServers);
      } else {
        alert(
          "Could not connect to server. Please check the address and port."
        );
      }
    } catch (error) {
      alert("Failed to connect to server. Please check the address and port.");
    }

    setConnecting(false);
  };

  const connectToServer = (server: ServerListItem, serverPassword?: string) => {
    if (!username.trim()) {
      alert("Please enter a username before connecting.");
      return;
    }

    if (server.requirePassword && !serverPassword) {
      setSelectedServer(server);
      setShowPasswordModal(true);
      return;
    }

    // Save username to localStorage
    localStorage.setItem("CHADD-username", username);
    onConnect(server.host, server.port, serverPassword, username);
  };

  const handlePasswordConnect = () => {
    if (selectedServer) {
      connectToServer(selectedServer, password);
      setShowPasswordModal(false);
      setPassword("");
      setSelectedServer(null);
    }
  };

  const removeServer = (index: number) => {
    const updatedServers = servers.filter((_, i) => i !== index);
    setServers(updatedServers);
    saveServers(updatedServers);
  };

  const refreshServers = () => {
    pingServers(servers);
  };

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>CHADD</Title>
          <Subtitle>High-quality communication</Subtitle>
        </HeaderLeft>
        <HeaderRight>
          <CloseButton onClick={onClose}>Close</CloseButton>
        </HeaderRight>
      </Header>

      <Content>
        <Section>
          <SectionTitle>Quick Connect</SectionTitle>
          <ConnectForm>
            <InputGroup>
              <Label>Username:</Label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                style={{ marginBottom: "10px" }}
              />
            </InputGroup>

            <InputGroup>
              <Label>Server:</Label>
              <Input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="localhost or IP address"
              />
              <Input
                type="number"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="27890"
                style={{ maxWidth: "100px" }}
              />
            </InputGroup>

            <QuickConnect>
              <Button
                variant="primary"
                onClick={addServer}
                disabled={connecting || !host || !port || !username.trim()}
              >
                {connecting ? "Connecting..." : "Add & Connect"}
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  connectToServer({
                    host,
                    port: parseInt(port),
                  } as ServerListItem)
                }
                disabled={!host || !port || !username.trim()}
              >
                Connect Only
              </Button>
            </QuickConnect>
          </ConnectForm>
        </Section>

        <Section>
          <SectionTitle>
            Server List
            <Button
              variant="secondary"
              onClick={refreshServers}
              style={{ float: "right", minWidth: "auto", padding: "6px 12px" }}
            >
              🔄 Refresh
            </Button>
          </SectionTitle>

          <ServerList>
            {servers.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#718096",
                  padding: "20px",
                }}
              >
                No servers added yet. Add a server above to get started!
              </div>
            ) : (
              servers.map((server, index) => (
                <ServerItem
                  key={`${server.host}:${server.port}`}
                  isOnline={server.isOnline}
                  onClick={() => connectToServer(server)}
                >
                  <ServerInfo>
                    <ServerName>
                      {server.name}
                      {server.requirePassword && " 🔒"}
                    </ServerName>
                    <ServerDetails>
                      <span>
                        {server.host}:{server.port}
                      </span>
                      <span>
                        {server.currentUsers || 0}/{server.maxUsers || 0} users
                      </span>
                      <span>{server.description}</span>
                    </ServerDetails>
                  </ServerInfo>
                  <ServerStatus isOnline={server.isOnline}>
                    <StatusBadge isOnline={server.isOnline}>
                      {server.isOnline ? "Online" : "Offline"}
                    </StatusBadge>
                    {server.isOnline && (
                      <Ping ping={server.ping}>{server.ping}ms</Ping>
                    )}
                    <Button
                      variant="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeServer(index);
                      }}
                      style={{
                        minWidth: "auto",
                        padding: "4px 8px",
                        fontSize: "12px",
                      }}
                    >
                      Remove
                    </Button>
                  </ServerStatus>
                </ServerItem>
              ))
            )}
          </ServerList>
        </Section>
      </Content>

      <PasswordModal show={showPasswordModal}>
        <ModalContent>
          <ModalTitle>🔒 Password Required</ModalTitle>
          <p style={{ color: "#a0aec0", marginBottom: "20px" }}>
            This server requires a password to connect.
          </p>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter server password"
            onKeyPress={(e) => e.key === "Enter" && handlePasswordConnect()}
            style={{ marginBottom: "20px" }}
          />
          <div
            style={{ display: "flex", gap: "10px", justifyContent: "center" }}
          >
            <Button variant="primary" onClick={handlePasswordConnect}>
              Connect
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setShowPasswordModal(false);
                setPassword("");
                setSelectedServer(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </ModalContent>
      </PasswordModal>
    </Container>
  );
}
