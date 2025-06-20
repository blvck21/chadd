import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { FaPaperPlane, FaGlobe, FaHome } from "react-icons/fa";
import { useVoiceStore } from "../stores/voiceStore";

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
`;

const TabHeader = styled.div`
  display: flex;
  background: #2a2a2a;
  border-bottom: 1px solid #404040;
`;

const Tab = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== "active",
})<{ active: boolean }>`
  flex: 1;
  padding: 10px;
  background: ${(props) => (props.active ? "#3a3a3a" : "transparent")};
  border: none;
  border-bottom: 2px solid
    ${(props) => (props.active ? "#ffd700" : "transparent")};
  color: ${(props) => (props.active ? "#ffd700" : "#888")};
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    background: #3a3a3a;
    color: #e0e0e0;
  }
`;

const Messages = styled.div`
  flex: 1;
  padding: 8px;
  overflow-y: auto;
  min-height: 0;
`;

const Message = styled.div`
  margin: 4px 0;
  font-size: 12px;
  line-height: 1.4;
`;

const MessageUser = styled.span.withConfig({
  shouldForwardProp: (prop) => !["isCurrentUser", "isGlobal"].includes(prop),
})<{
  isCurrentUser?: boolean;
  isGlobal?: boolean;
}>`
  color: ${(props) =>
    props.isCurrentUser ? "#ffd700" : props.isGlobal ? "#667eea" : "#90ee90"};
  font-weight: bold;
  margin-right: 8px;
  ${(props) =>
    props.isGlobal &&
    `
    text-shadow: 0 1px 2px rgba(102, 126, 234, 0.3);
  `}
`;

const MessageTime = styled.span`
  color: #666;
  font-size: 10px;
  margin-right: 8px;
`;

const MessageText = styled.span`
  color: #e0e0e0;
`;

const SystemMessage = styled.div`
  color: #90ee90;
  font-style: italic;
  font-size: 11px;
  margin: 2px 0;
`;

const GlobalBadge = styled.span`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 9px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 6px;
  margin-right: 4px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: inline-flex;
  align-items: center;
  gap: 3px;

  &::before {
    content: "🌍";
    font-size: 8px;
  }
`;

const InputArea = styled.div`
  padding: 8px;
  background: #2a2a2a;
  border-top: 1px solid #404040;
  display: flex;
  gap: 8px;
`;

const MessageInput = styled.input`
  flex: 1;
  background: #1a1a1a;
  border: 1px solid #404040;
  color: #e0e0e0;
  padding: 6px 8px;
  border-radius: 3px;
  font-size: 12px;
  font-family: "Courier New", monospace;

  &:focus {
    outline: none;
    border-color: #ffd700;
  }

  &::placeholder {
    color: #666;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  background: #3a5998;
  border: 1px solid #4a69a8;
  color: #e0e0e0;
  padding: 6px 12px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;

  &:hover:not(:disabled) {
    background: #4a69a8;
  }

  &:disabled {
    background: #2a2a2a;
    border-color: #404040;
    color: #666;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  font-size: 14px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const MessageCount = styled.span`
  background: #667eea;
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 1px 5px;
  border-radius: 8px;
  margin-left: 6px;
  min-width: 16px;
  text-align: center;
`;

const Chat: React.FC = () => {
  const {
    currentRoom,
    currentUser,
    chatMessages,
    sendChatMessage,
    sendGlobalChatMessage,
    isConnected,
  } = useVoiceStore();

  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"room" | "global">("room");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get messages based on active tab
  const currentMessages =
    activeTab === "global"
      ? chatMessages.get("global") || []
      : currentRoom
      ? chatMessages.get(currentRoom.id) || []
      : [];

  // Get message counts for tabs
  const globalMessageCount = chatMessages.get("global")?.length || 0;
  const roomMessageCount = currentRoom
    ? chatMessages.get(currentRoom.id)?.length || 0
    : 0;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  // Switch to room tab when joining a room
  useEffect(() => {
    if (currentRoom && activeTab === "global") {
      setActiveTab("room");
    }
  }, [currentRoom]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !isConnected || !currentUser) return;

    if (activeTab === "global") {
      sendGlobalChatMessage(newMessage);
    } else if (currentRoom) {
      sendChatMessage(newMessage);
    }

    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPlaceholder = () => {
    if (activeTab === "global") {
      return "Type a message to the server...";
    } else if (currentRoom) {
      return `Type a message in #${currentRoom.name}...`;
    } else {
      return "Join a channel to chat...";
    }
  };

  const canSendMessage =
    isConnected && currentUser && (activeTab === "global" || currentRoom);

  return (
    <Container>
      <TabHeader>
        <Tab
          active={activeTab === "room"}
          onClick={() => setActiveTab("room")}
          disabled={!currentRoom}
        >
          <FaHome />
          {currentRoom ? `#${currentRoom.name}` : "No Channel"}
          {currentRoom && roomMessageCount > 0 && (
            <MessageCount>{roomMessageCount}</MessageCount>
          )}
        </Tab>
        <Tab
          active={activeTab === "global"}
          onClick={() => setActiveTab("global")}
          disabled={!isConnected}
        >
          <FaGlobe />
          Global Chat
          {globalMessageCount > 0 && (
            <MessageCount>{globalMessageCount}</MessageCount>
          )}
          {activeTab === "global" && (
            <span style={{ marginLeft: "4px" }}>🌍</span>
          )}
        </Tab>
      </TabHeader>

      <Messages>
        {currentMessages.length === 0 ? (
          <EmptyState>
            <EmptyIcon>{activeTab === "global" ? "🌍" : "💬"}</EmptyIcon>
            <div>
              {activeTab === "global"
                ? "Welcome to Global Chat!"
                : currentRoom
                ? `Welcome to #${currentRoom.name}!`
                : "Join a channel to start chatting!"}
            </div>
            <div style={{ fontSize: "12px", marginTop: "8px", opacity: 0.7 }}>
              {activeTab === "global"
                ? "🌐 Chat with everyone on this server - messages are visible to all connected users"
                : currentRoom
                ? "Be the first to send a message in this channel"
                : "Select a channel from the left to see its chat"}
            </div>
          </EmptyState>
        ) : (
          currentMessages.map((message, index) =>
            message.type === "system" ? (
              <SystemMessage key={index}>
                {formatTime(new Date(message.timestamp))} - {message.message}
              </SystemMessage>
            ) : (
              <Message key={index}>
                <MessageTime>
                  {formatTime(new Date(message.timestamp))}
                </MessageTime>
                <MessageUser
                  isCurrentUser={message.userId === currentUser?.id}
                  isGlobal={message.isGlobal}
                >
                  {message.username}:
                </MessageUser>
                {message.isGlobal && <GlobalBadge>GLOBAL</GlobalBadge>}
                <MessageText>{message.message}</MessageText>
              </Message>
            )
          )
        )}
        <div ref={messagesEndRef} />
      </Messages>

      <InputArea>
        <MessageInput
          type="text"
          placeholder={getPlaceholder()}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={!canSendMessage}
        />
        <SendButton
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || !canSendMessage}
        >
          <FaPaperPlane />
        </SendButton>
      </InputArea>
    </Container>
  );
};

export default Chat;
