import { useState, useEffect } from "react";
import styled from "styled-components";

interface ServerConfig {
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
    defaultCodec: "opus" | "g722" | "pcmu";
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
    logLevel: "debug" | "info" | "warn" | "error";
    enableMetrics: boolean;
    allowCrossOrigin: boolean;
    enableRateLimit: boolean;
    rateLimitWindow: number;
    rateLimitMax: number;
  };
}

interface Props {
  onClose: () => void;
  onStartServer: (config: ServerConfig) => void;
  onStopServer: () => void;
  serverRunning: boolean;
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

const Container = styled.div`
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  border-radius: 16px;
  border: 2px solid #00d4ff;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  width: 90vw;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  background: linear-gradient(90deg, #00d4ff 0%, #0099cc 100%);
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(26, 32, 44, 0.6);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #4a5568;
    border-radius: 4px;

    &:hover {
      background: #00d4ff;
    }
  }
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 2px solid #4a5568;
`;

const Tab = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== "active",
})<{ active: boolean }>`
  padding: 12px 20px;
  border: none;
  background: ${(props) =>
    props.active ? "linear-gradient(45deg, #00d4ff, #0099cc)" : "transparent"};
  color: ${(props) => (props.active ? "white" : "#a0aec0")};
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) =>
      props.active
        ? "linear-gradient(45deg, #00d4ff, #0099cc)"
        : "rgba(0, 212, 255, 0.1)"};
    color: ${(props) => (props.active ? "white" : "#00d4ff")};
  }
`;

const Section = styled.div`
  background: rgba(45, 55, 72, 0.6);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #4a5568;
`;

const SectionTitle = styled.h3`
  margin: 0 0 15px 0;
  color: #00d4ff;
  font-size: 18px;
  font-weight: 500;
  border-bottom: 2px solid #4a5568;
  padding-bottom: 8px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
`;

const Label = styled.label`
  color: #e2e8f0;
  font-weight: 500;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 10px 12px;
  background: rgba(26, 32, 44, 0.8);
  border: 2px solid #4a5568;
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 14px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #00d4ff;
    box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
  }

  &::placeholder {
    color: #718096;
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  background: rgba(26, 32, 44, 0.8);
  border: 2px solid #4a5568;
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 14px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #00d4ff;
    box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 10px 12px;
  background: rgba(26, 32, 44, 0.8);
  border: 2px solid #4a5568;
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #00d4ff;
    box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
  }

  &::placeholder {
    color: #718096;
  }
`;

const Checkbox = styled.input`
  margin-right: 8px;
  transform: scale(1.2);
  accent-color: #00d4ff;
`;

const CheckboxLabel = styled.label`
  color: #e2e8f0;
  font-size: 14px;
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-bottom: 10px;

  &:hover {
    color: #00d4ff;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  padding: 20px;
  border-top: 2px solid #4a5568;
  background: rgba(26, 32, 44, 0.6);
`;

const Button = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== "variant",
})<{
  variant?: "primary" | "secondary" | "danger" | "success";
}>`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;

  ${(props) =>
    props.variant === "primary" &&
    `
    background: linear-gradient(45deg, #00d4ff, #0099cc);
    color: white;
    box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 212, 255, 0.4);
    }
  `}

  ${(props) =>
    props.variant === "secondary" &&
    `
    background: rgba(74, 85, 104, 0.8);
    color: #e2e8f0;
    border: 1px solid #4a5568;
    
    &:hover {
      background: rgba(74, 85, 104, 1);
      border-color: #00d4ff;
    }
  `}
  
  ${(props) =>
    props.variant === "success" &&
    `
    background: linear-gradient(45deg, #48bb78, #38a169);
    color: white;
    
    &:hover {
      transform: translateY(-1px);
    }
  `}
  
  ${(props) =>
    props.variant === "danger" &&
    `
    background: linear-gradient(45deg, #e53e3e, #c53030);
    color: white;
    
    &:hover {
      transform: translateY(-1px);
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const StatusIndicator = styled.div<{ running: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;

  ${(props) =>
    props.running
      ? `
    background: rgba(72, 187, 120, 0.2);
    color: #48bb78;
    border: 1px solid #48bb78;
  `
      : `
    background: rgba(229, 62, 62, 0.2);
    color: #e53e3e;
    border: 1px solid #e53e3e;
  `}

  &::before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
    animation: ${(props) => (props.running ? "pulse 2s infinite" : "none")};
  }

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }
`;

const defaultConfig: ServerConfig = {
  server: {
    name: "CHADD Server",
    description: "High-quality V1.0.1 server",
    port: 27890,
    maxUsers: 100,
    motd: "Welcome to CHADD! 🎙️ Enjoy crystal clear voice communication.",
    password: "",
    requirePassword: false,
  },
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

export default function ServerSettings({
  onClose,
  onStartServer,
  onStopServer,
  serverRunning,
}: Props) {
  const [activeTab, setActiveTab] = useState("server");
  const [config, setConfig] = useState<ServerConfig>(defaultConfig);

  useEffect(() => {
    // Load saved config
    const savedConfig = localStorage.getItem("CHADD-server-config");
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error("Failed to load server config:", error);
      }
    }
  }, []);

  const saveConfig = () => {
    localStorage.setItem("CHADD-server-config", JSON.stringify(config));
  };

  const updateConfig = (
    section: keyof ServerConfig,
    field: string,
    value: any
  ) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleStartServer = () => {
    saveConfig();
    onStartServer(config);
  };

  const renderServerTab = () => (
    <>
      <Section>
        <SectionTitle>Basic Settings</SectionTitle>
        <InputGroup>
          <Label>Server Name</Label>
          <Input
            value={config.server.name}
            onChange={(e) => updateConfig("server", "name", e.target.value)}
            placeholder="My CHADD Server"
          />
        </InputGroup>
        <InputGroup>
          <Label>Description</Label>
          <Input
            value={config.server.description}
            onChange={(e) =>
              updateConfig("server", "description", e.target.value)
            }
            placeholder="A cool voice chat server"
          />
        </InputGroup>
        <InputGroup>
          <Label>Port</Label>
          <Input
            type="number"
            value={config.server.port}
            onChange={(e) =>
              updateConfig("server", "port", parseInt(e.target.value))
            }
            min="1024"
            max="65535"
          />
        </InputGroup>
        <InputGroup>
          <Label>Max Users</Label>
          <Input
            type="number"
            value={config.server.maxUsers}
            onChange={(e) =>
              updateConfig("server", "maxUsers", parseInt(e.target.value))
            }
            min="1"
            max="1000"
          />
        </InputGroup>
        <InputGroup>
          <Label>Message of the Day</Label>
          <TextArea
            value={config.server.motd}
            onChange={(e) => updateConfig("server", "motd", e.target.value)}
            placeholder="Welcome message for users..."
          />
        </InputGroup>
      </Section>

      <Section>
        <SectionTitle>Security</SectionTitle>
        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            checked={config.server.requirePassword}
            onChange={(e) =>
              updateConfig("server", "requirePassword", e.target.checked)
            }
          />
          Require password to connect
        </CheckboxLabel>
        {config.server.requirePassword && (
          <InputGroup>
            <Label>Server Password</Label>
            <Input
              type="password"
              value={config.server.password}
              onChange={(e) =>
                updateConfig("server", "password", e.target.value)
              }
              placeholder="Enter server password"
            />
          </InputGroup>
        )}
      </Section>
    </>
  );

  const renderAudioTab = () => (
    <>
      <Section>
        <SectionTitle>Audio Quality</SectionTitle>
        <InputGroup>
          <Label>Default Codec</Label>
          <Select
            value={config.audio.defaultCodec}
            onChange={(e) =>
              updateConfig("audio", "defaultCodec", e.target.value)
            }
          >
            <option value="opus">Opus (Recommended)</option>
            <option value="g722">G.722</option>
            <option value="pcmu">PCMU</option>
          </Select>
        </InputGroup>
        <InputGroup>
          <Label>Sample Rate (Hz)</Label>
          <Select
            value={config.audio.sampleRate}
            onChange={(e) =>
              updateConfig("audio", "sampleRate", parseInt(e.target.value))
            }
          >
            <option value="48000">48,000 Hz (Studio Quality)</option>
            <option value="44100">44,100 Hz (CD Quality)</option>
            <option value="16000">16,000 Hz (Telephone Quality)</option>
          </Select>
        </InputGroup>
        <InputGroup>
          <Label>Bitrate (bps)</Label>
          <Input
            type="number"
            value={config.audio.bitrate}
            onChange={(e) =>
              updateConfig("audio", "bitrate", parseInt(e.target.value))
            }
            min="8000"
            max="512000"
            step="1000"
          />
        </InputGroup>
        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            checked={config.audio.fec}
            onChange={(e) => updateConfig("audio", "fec", e.target.checked)}
          />
          Enable Forward Error Correction (FEC)
        </CheckboxLabel>
        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            checked={config.audio.dtx}
            onChange={(e) => updateConfig("audio", "dtx", e.target.checked)}
          />
          Enable Discontinuous Transmission (DTX)
        </CheckboxLabel>
      </Section>
    </>
  );

  const renderChannelsTab = () => (
    <>
      <Section>
        <SectionTitle>Channel Settings</SectionTitle>
        <InputGroup>
          <Label>Default Channel Name</Label>
          <Input
            value={config.channels.defaultChannelName}
            onChange={(e) =>
              updateConfig("channels", "defaultChannelName", e.target.value)
            }
            placeholder="Main Hall"
          />
        </InputGroup>
        <InputGroup>
          <Label>Default Channel Description</Label>
          <Input
            value={config.channels.defaultChannelDescription}
            onChange={(e) =>
              updateConfig(
                "channels",
                "defaultChannelDescription",
                e.target.value
              )
            }
            placeholder="Welcome to the main channel!"
          />
        </InputGroup>
        <InputGroup>
          <Label>Max Channels per Server</Label>
          <Input
            type="number"
            value={config.channels.maxChannelsPerServer}
            onChange={(e) =>
              updateConfig(
                "channels",
                "maxChannelsPerServer",
                parseInt(e.target.value)
              )
            }
            min="1"
            max="100"
          />
        </InputGroup>
        <InputGroup>
          <Label>Max Users per Channel</Label>
          <Input
            type="number"
            value={config.channels.maxUsersPerChannel}
            onChange={(e) =>
              updateConfig(
                "channels",
                "maxUsersPerChannel",
                parseInt(e.target.value)
              )
            }
            min="1"
            max="200"
          />
        </InputGroup>
        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            checked={config.channels.allowUserChannelCreation}
            onChange={(e) =>
              updateConfig(
                "channels",
                "allowUserChannelCreation",
                e.target.checked
              )
            }
          />
          Allow users to create channels
        </CheckboxLabel>
      </Section>
    </>
  );

  const renderAdvancedTab = () => (
    <>
      <Section>
        <SectionTitle>Logging & Monitoring</SectionTitle>
        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            checked={config.advanced.enableLogging}
            onChange={(e) =>
              updateConfig("advanced", "enableLogging", e.target.checked)
            }
          />
          Enable logging
        </CheckboxLabel>
        <InputGroup>
          <Label>Log Level</Label>
          <Select
            value={config.advanced.logLevel}
            onChange={(e) =>
              updateConfig("advanced", "logLevel", e.target.value)
            }
          >
            <option value="debug">Debug</option>
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Error</option>
          </Select>
        </InputGroup>
        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            checked={config.advanced.enableMetrics}
            onChange={(e) =>
              updateConfig("advanced", "enableMetrics", e.target.checked)
            }
          />
          Enable performance metrics
        </CheckboxLabel>
      </Section>

      <Section>
        <SectionTitle>Network & Security</SectionTitle>
        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            checked={config.advanced.allowCrossOrigin}
            onChange={(e) =>
              updateConfig("advanced", "allowCrossOrigin", e.target.checked)
            }
          />
          Allow cross-origin requests
        </CheckboxLabel>
        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            checked={config.advanced.enableRateLimit}
            onChange={(e) =>
              updateConfig("advanced", "enableRateLimit", e.target.checked)
            }
          />
          Enable rate limiting
        </CheckboxLabel>
        {config.advanced.enableRateLimit && (
          <>
            <InputGroup>
              <Label>Rate Limit Window (ms)</Label>
              <Input
                type="number"
                value={config.advanced.rateLimitWindow}
                onChange={(e) =>
                  updateConfig(
                    "advanced",
                    "rateLimitWindow",
                    parseInt(e.target.value)
                  )
                }
                min="1000"
                max="300000"
              />
            </InputGroup>
            <InputGroup>
              <Label>Max Requests per Window</Label>
              <Input
                type="number"
                value={config.advanced.rateLimitMax}
                onChange={(e) =>
                  updateConfig(
                    "advanced",
                    "rateLimitMax",
                    parseInt(e.target.value)
                  )
                }
                min="1"
                max="1000"
              />
            </InputGroup>
          </>
        )}
      </Section>
    </>
  );

  return (
    <Overlay>
      <Container>
        <Header>
          <div>
            <Title>🏠 Server Settings</Title>
            <StatusIndicator running={serverRunning}>
              {serverRunning ? "Server Running" : "Server Stopped"}
            </StatusIndicator>
          </div>
          <CloseButton onClick={onClose}>×</CloseButton>
        </Header>

        <TabContainer>
          <Tab
            active={activeTab === "server"}
            onClick={() => setActiveTab("server")}
          >
            Server
          </Tab>
          <Tab
            active={activeTab === "audio"}
            onClick={() => setActiveTab("audio")}
          >
            Audio
          </Tab>
          <Tab
            active={activeTab === "channels"}
            onClick={() => setActiveTab("channels")}
          >
            Channels
          </Tab>
          <Tab
            active={activeTab === "advanced"}
            onClick={() => setActiveTab("advanced")}
          >
            Advanced
          </Tab>
        </TabContainer>

        <Content>
          {activeTab === "server" && renderServerTab()}
          {activeTab === "audio" && renderAudioTab()}
          {activeTab === "channels" && renderChannelsTab()}
          {activeTab === "advanced" && renderAdvancedTab()}
        </Content>

        <ButtonGroup>
          <Button variant="secondary" onClick={() => setConfig(defaultConfig)}>
            Reset to Defaults
          </Button>
          <Button variant="secondary" onClick={saveConfig}>
            Save Config
          </Button>
          <div style={{ flex: 1 }} />
          {serverRunning ? (
            <Button variant="danger" onClick={onStopServer}>
              🛑 Stop Server
            </Button>
          ) : (
            <Button variant="success" onClick={handleStartServer}>
              🚀 Start Server
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </ButtonGroup>
      </Container>
    </Overlay>
  );
}
