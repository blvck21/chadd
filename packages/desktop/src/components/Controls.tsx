import React from "react";
import styled from "styled-components";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVolumeUp,
  FaVolumeMute,
  FaPhoneSlash,
  FaHeadphones,
} from "react-icons/fa";
import { useVoiceStore } from "../stores/voiceStore";

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  width: 100%;
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ControlButton = styled.button<{ active?: boolean; danger?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid
    ${(props) =>
      props.danger ? "#ff6b6b" : props.active ? "#90ee90" : "#505050"};
  background: ${(props) =>
    props.danger
      ? "rgba(255, 107, 107, 0.2)"
      : props.active
      ? "rgba(144, 238, 144, 0.2)"
      : "#3a3a3a"};
  color: ${(props) =>
    props.danger ? "#ff6b6b" : props.active ? "#90ee90" : "#e0e0e0"};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: ${(props) =>
    props.active
      ? "0 0 12px rgba(144, 238, 144, 0.4)"
      : props.danger
      ? "0 0 12px rgba(255, 107, 107, 0.4)"
      : "none"};

  &:hover {
    transform: scale(1.05);
    border-color: ${(props) =>
      props.danger ? "#ff8a8a" : props.active ? "#a8f0a8" : "#606060"};
  }

  &:active {
    transform: scale(0.95);
  }
`;

const VolumeControl = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #2a2a2a;
  padding: 8px 12px;
  border-radius: 20px;
  border: 1px solid #404040;
`;

const VolumeSlider = styled.input`
  width: 80px;
  height: 4px;
  background: #404040;
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: #90ee90;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 8px rgba(144, 238, 144, 0.4);
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #90ee90;
    border-radius: 50%;
    cursor: pointer;
    border: none;
    box-shadow: 0 0 8px rgba(144, 238, 144, 0.4);
  }
`;

const VolumeLabel = styled.span`
  font-size: 11px;
  color: #888;
  min-width: 30px;
`;

const UserInfo = styled.div`
  flex: 1;
  text-align: center;
`;

const Username = styled.div`
  font-size: 14px;
  color: #ffd700;
  font-weight: bold;
`;

const Status = styled.div`
  font-size: 11px;
  color: #888;
`;

const Controls: React.FC = () => {
  const {
    isMuted,
    isDeafened,
    micVolume,
    speakerVolume,
    currentRoom,
    currentUser,
    toggleMute,
    toggleDeafen,
    setMicVolume,
    setSpeakerVolume,
    leaveRoom,
  } = useVoiceStore();

  return (
    <Container>
      {/* Microphone Control */}
      <ControlGroup>
        <ControlButton
          active={!isMuted}
          danger={isMuted}
          onClick={toggleMute}
          title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
        >
          {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
        </ControlButton>

        <VolumeControl>
          <FaMicrophone size={12} color="#888" />
          <VolumeSlider
            type="range"
            min="0"
            max="100"
            value={micVolume}
            onChange={(e) => setMicVolume(Number(e.target.value))}
          />
          <VolumeLabel>{micVolume}%</VolumeLabel>
        </VolumeControl>
      </ControlGroup>

      {/* Speaker Control */}
      <ControlGroup>
        <ControlButton
          active={!isDeafened}
          danger={isDeafened}
          onClick={toggleDeafen}
          title={isDeafened ? "Undeafen" : "Deafen"}
        >
          {isDeafened ? <FaVolumeMute /> : <FaHeadphones />}
        </ControlButton>

        <VolumeControl>
          <FaVolumeUp size={12} color="#888" />
          <VolumeSlider
            type="range"
            min="0"
            max="100"
            value={speakerVolume}
            onChange={(e) => setSpeakerVolume(Number(e.target.value))}
          />
          <VolumeLabel>{speakerVolume}%</VolumeLabel>
        </VolumeControl>
      </ControlGroup>

      {/* User Info */}
      <UserInfo>
        {currentUser && (
          <>
            <Username>{currentUser.username}</Username>
            <Status>
              {currentRoom ? `📢 ${currentRoom.name}` : "🏠 Not in channel"}
            </Status>
          </>
        )}
      </UserInfo>

      {/* Disconnect/Settings */}
      <ControlGroup>
        {currentRoom && (
          <ControlButton danger onClick={leaveRoom} title="Leave Channel">
            <FaPhoneSlash />
          </ControlButton>
        )}
      </ControlGroup>
    </Container>
  );
};

export default Controls;
