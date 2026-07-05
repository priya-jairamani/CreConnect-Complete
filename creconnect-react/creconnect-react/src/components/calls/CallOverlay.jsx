import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

function getInitials(name = '') {
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2) || '?';
}

export default function CallOverlay({ callType, callState, otherName, otherAvatar, onEnd, onAccept, localStream, remoteStream }) {
  const [elapsed, setElapsed] = useState(0);
  const [muted,   setMuted]   = useState(false);
  const [camOff,  setCamOff]  = useState(false);
  const timer = useRef(null);
  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    if (callState === 'connected') timer.current = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(timer.current);
  }, [callState]);

  // Bind streams to their media elements as they arrive
  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream || null;
  }, [localStream]);
  useEffect(() => {
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream || null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = remoteStream || null;
  }, [remoteStream]);

  // Toggle actual mic/camera tracks — not just cosmetic UI state
  useEffect(() => {
    const track = localStream?.getAudioTracks?.()[0];
    if (track) track.enabled = !muted;
  }, [muted, localStream]);
  useEffect(() => {
    const track = localStream?.getVideoTracks?.()[0];
    if (track) track.enabled = !camOff;
  }, [camOff, localStream]);

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(8,9,18,0.97)', backdropFilter: 'blur(24px)' }}
    >
      <div className="flex flex-col items-center gap-8 w-full max-w-xs text-center animate-fade-up px-6">

        {/* Avatar + ripple */}
        <div className="relative flex items-center justify-center">
          {(callState === 'calling' || callState === 'connecting') && <>
            <span className="absolute w-36 h-36 rounded-full animate-ping" style={{ background: 'rgba(109,92,255,0.15)', animationDuration: '1.4s' }} />
            <span className="absolute w-28 h-28 rounded-full animate-ping" style={{ background: 'rgba(109,92,255,0.2)', animationDuration: '1s' }} />
          </>}
          <div className="relative w-24 h-24 rounded-full ring-4" style={{ '--tw-ring-color': 'rgba(109,92,255,0.5)' }}>
            {otherAvatar
              ? <img src={otherAvatar} alt="" className="w-24 h-24 rounded-full object-cover" />
              : (
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)' }}>
                  {getInitials(otherName)}
                </div>
              )
            }
          </div>
        </div>

        {/* Name + state */}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>{otherName}</h2>
          <p className="text-white/50 text-sm font-medium">
            {callState === 'calling'    && (callType === 'video' ? 'Video calling…' : 'Voice calling…')}
            {callState === 'ringing'    && 'Incoming call…'}
            {callState === 'connecting' && 'Connecting…'}
            {callState === 'connected'  && fmt(elapsed)}
          </p>
        </div>

        {/* Video */}
        {callType === 'video' && (callState === 'connecting' || callState === 'connected') && (
          <div className="w-full rounded-2xl overflow-hidden relative" style={{ aspectRatio: '4/3', background: '#0b0c14', border: '1px solid rgba(255,255,255,0.06)' }}>
            {camOff ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <span className="text-3xl">📷</span>
                <span className="text-xs text-white/30">Camera off</span>
              </div>
            ) : (
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            )}
            <video ref={localVideoRef} autoPlay playsInline muted className="absolute bottom-2 right-2 w-20 h-16 rounded-lg object-cover border" style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
          </div>
        )}
        {/* Hidden audio sink for voice calls (video calls already play audio via the remote <video>) */}
        {callType === 'voice' && <audio ref={remoteAudioRef} autoPlay />}

        {/* Controls */}
        <div className="flex items-center justify-center gap-5">
          {callState === 'ringing' && (
            <button
              onClick={onAccept}
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all hover:scale-110 active:scale-95"
              style={{ background: '#16b364', boxShadow: '0 8px 24px rgba(22,179,100,0.4)' }}
            >
              📞
            </button>
          )}

          {callState === 'connected' && (
            <>
              <button
                onClick={() => setMuted(m => !m)}
                className="w-14 h-14 rounded-full flex flex-col items-center justify-center gap-0.5 text-base transition-all hover:scale-110"
                style={{ background: muted ? 'rgba(240,68,95,0.2)' : 'rgba(255,255,255,0.08)', border: `1px solid ${muted ? 'rgba(240,68,95,0.4)' : 'rgba(255,255,255,0.1)'}`, color: muted ? '#f0445f' : '#fff' }}
              >
                {muted ? '🔇' : '🎤'}
                <span className="text-[9px] font-medium" style={{ color: muted ? '#f0445f' : 'rgba(255,255,255,0.4)' }}>{muted ? 'Muted' : 'Mute'}</span>
              </button>
              {callType === 'video' && (
                <button
                  onClick={() => setCamOff(c => !c)}
                  className="w-14 h-14 rounded-full flex flex-col items-center justify-center gap-0.5 text-base transition-all hover:scale-110"
                  style={{ background: camOff ? 'rgba(240,68,95,0.2)' : 'rgba(255,255,255,0.08)', border: `1px solid ${camOff ? 'rgba(240,68,95,0.4)' : 'rgba(255,255,255,0.1)'}`, color: camOff ? '#f0445f' : '#fff' }}
                >
                  {camOff ? '📷' : '📹'}
                  <span className="text-[9px] font-medium" style={{ color: camOff ? '#f0445f' : 'rgba(255,255,255,0.4)' }}>Camera</span>
                </button>
              )}
            </>
          )}

          {/* End / Decline */}
          <button
            onClick={onEnd}
            className="w-16 h-16 rounded-full flex flex-col items-center justify-center gap-0.5 text-2xl transition-all hover:scale-110 active:scale-95"
            style={{ background: '#f0445f', boxShadow: '0 8px 24px rgba(240,68,95,0.4)' }}
          >
            📵
            <span className="text-[9px] font-medium text-white/70">{callState === 'ringing' ? 'Decline' : 'End'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
CallOverlay.propTypes = {
  callType:     PropTypes.oneOf(['voice', 'video']).isRequired,
  callState:    PropTypes.oneOf(['calling', 'ringing', 'connecting', 'connected']).isRequired,
  otherName:    PropTypes.string.isRequired,
  otherAvatar:  PropTypes.string,
  onEnd:        PropTypes.func.isRequired,
  onAccept:     PropTypes.func,
  localStream:  PropTypes.object,
  remoteStream: PropTypes.object,
};
