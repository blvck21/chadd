import React, { useEffect } from "react";
import { useVoiceStore } from "../stores/voiceStore";

const VoiceManager: React.FC = () => {
  const { audioStreams } = useVoiceStore();

  useEffect(() => {
    // Handle audio stream changes
    audioStreams.forEach((stream, userId) => {
      const audio = document.getElementById(
        `audio-${userId}`
      ) as HTMLAudioElement;
      if (audio) {
        audio.srcObject = stream;
      }
    });
  }, [audioStreams]);

  return (
    <div style={{ display: "none" }}>
      {/* Hidden audio elements for remote streams */}
      {Array.from(audioStreams.keys()).map((userId) => (
        <audio key={userId} id={`audio-${userId}`} autoPlay playsInline />
      ))}
    </div>
  );
};

export default VoiceManager;
