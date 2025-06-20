import React from "react";
import styled from "styled-components";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaHeadphones,
  FaVolumeMute,
} from "react-icons/fa";
import { useVoiceStore } from "../stores/voiceStore";

const Container = styled.div`
  height: 300px;
  border-bottom: 2px solid #404040;
  background: #252525;
`;

const Header = styled.div`
  background: #3a3a3a;
  border-bottom: 1px solid #505050;
  padding: 12px 16px;
  font-weight: bold;
  font-size: 14px;
  color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.div`
  font-weight: bold;
  font-size: 14px;
  color: #e0e0e0;
`;

const UserContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
`;

const UserItem = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "speaking",
})<{ speaking?: boolean }>`
  display: flex;
  align-items: center;
  padding: 6px 8px;
  margin: 2px 0;
  border-radius: 3px;
  background: ${(props) =>
    props.speaking ? "rgba(144, 238, 144, 0.1)" : "transparent"};
  border: 1px solid ${(props) => (props.speaking ? "#90ee90" : "transparent")};
  transition: all 0.2s ease;
`;

const UserAvatar = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "speaking",
})<{ speaking?: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3a3a3a, #5a5a5a);
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${(props) => (props.speaking ? "#90ee90" : "#505050")};
  box-shadow: ${(props) =>
    props.speaking ? "0 0 8px rgba(144, 238, 144, 0.5)" : "none"};
  transition: all 0.2s ease;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const Username = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "isAdmin",
})<{ isAdmin?: boolean }>`
  font-size: 13px;
  color: ${(props) => (props.isAdmin ? "#ffd700" : "#e0e0e0")};
  font-weight: ${(props) => (props.isAdmin ? "bold" : "normal")};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const UserStatus = styled.div`
  font-size: 11px;
  color: #888;
`;

const AudioIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => !["active", "color"].includes(prop),
})<{ active?: boolean; color?: string }>`
  color: ${(props) => (props.active ? props.color || "#90ee90" : "#666")};
  font-size: 12px;
  transition: color 0.2s ease;
`;

const VoiceActivity = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "level",
})<{ level: number }>`
  width: 4px;
  height: 16px;
  background: linear-gradient(
    to top,
    #90ee90 0%,
    #90ee90 ${(props) => props.level}%,
    #333 ${(props) => props.level}%,
    #333 100%
  );
  border-radius: 2px;
  margin-left: 4px;
`;

const UserList: React.FC = () => {
  const { currentRoom, currentUser, audioStreams, speakingUsers } =
    useVoiceStore();

  if (!currentRoom || !currentRoom.users) return null;

  return (
    <Container>
      <Header>
        <Title>👥 Users ({currentRoom.users.length})</Title>
      </Header>
      <UserContainer>
        {currentRoom.users.map((user) => {
          const hasAudioStream = audioStreams.has(user.id);
          const isSpeaking = speakingUsers.has(user.id);
          const isCurrentUserItem = currentUser?.id === user.id;

          return (
            <UserItem key={user.id} speaking={isSpeaking}>
              <UserAvatar speaking={isSpeaking}>
                {user.username.charAt(0).toUpperCase()}
              </UserAvatar>
              <UserInfo>
                <Username>
                  {user.username}
                  {isCurrentUserItem && " (You)"}
                </Username>
                <UserStatus>
                  {/* Show mute/deafen status for all users */}
                  {user.isDeafened
                    ? "🔇 Deafened"
                    : user.isMuted
                    ? "🔇 Muted"
                    : isSpeaking
                    ? "🎤 Speaking"
                    : hasAudioStream
                    ? "🎧 Connected"
                    : "💤 Idle"}
                </UserStatus>
              </UserInfo>
              <AudioIcon>
                {user.isDeafened ? (
                  <FaVolumeMute color="#ff6b6b" />
                ) : user.isMuted ? (
                  <FaMicrophoneSlash color="#ff6b6b" />
                ) : isSpeaking ? (
                  <FaMicrophone color="#90ee90" />
                ) : hasAudioStream ? (
                  <FaHeadphones color="#888" />
                ) : (
                  <FaVolumeMute color="#666" />
                )}
              </AudioIcon>
              {isSpeaking && <VoiceActivity level={Math.random() * 100} />}
            </UserItem>
          );
        })}
      </UserContainer>
    </Container>
  );
};

export default UserList;
