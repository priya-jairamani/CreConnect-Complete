import { createContext, useContext, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuthContext } from './AuthContext';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/hooks/useToast';
import { resolveMediaUrl } from '@/utils/media';
import CallOverlay from '@/components/calls/CallOverlay';

const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];

function myDisplayName(user) {
  const p = user?.profile ?? {};
  return p.displayName || p.companyName || p.username || user?.email?.split('@')[0] || 'User';
}

function myAvatar(user) {
  const p = user?.profile ?? {};
  return resolveMediaUrl(p.avatarUrl || p.logoUrl || null);
}

const CallContext = createContext(null);

// Call signaling rides the /notifications socket (connected app-wide as soon as
// the user logs in) instead of /chat, so a call rings no matter which page is open.
export function CallProvider({ children }) {
  const { isAuthenticated, accessToken, user } = useAuthContext();
  const toast = useToast();

  const [callType,     setCallType]     = useState(null); // 'voice' | 'video'
  const [callState,    setCallState]    = useState(null); // 'calling' | 'ringing' | 'connecting' | 'connected'
  const [peerInfo,     setPeerInfo]     = useState(null); // { userId, name, avatar }
  const [localStream,  setLocalStream]  = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const pcRef                = useRef(null);
  const localStreamRef       = useRef(null);
  const callInfoRef          = useRef(null); // { conversationId, otherUserId } for the call in flight
  const pendingCandidatesRef = useRef([]);
  const emitRef              = useRef(() => {});

  const flushPendingCandidates = async (pc) => {
    const queued = pendingCandidatesRef.current;
    pendingCandidatesRef.current = [];
    for (const c of queued) {
      // eslint-disable-next-line no-await-in-loop
      await pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
    }
  };

  const createPeerConnection = (toUserId) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        emitRef.current('call-ice-candidate', {
          to: toUserId,
          conversationId: callInfoRef.current?.conversationId,
          candidate: e.candidate,
        });
      }
    };
    pc.ontrack = (e) => {
      setRemoteStream(prev => {
        const stream = prev || new MediaStream();
        stream.addTrack(e.track);
        return stream;
      });
      setCallState('connected');
    };
    return pc;
  };

  const closeCall = () => {
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    pendingCandidatesRef.current = [];
    callInfoRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setCallType(null);
    setCallState(null);
    setPeerInfo(null);
  };

  const { emit } = useSocket('/notifications', {
    token: isAuthenticated ? accessToken : null,
    events: {
      'call-incoming': ({ from, callType: ct, conversationId, fromName, fromAvatar }) => {
        if (callState) { // already on a call — auto-decline
          emitRef.current('call-reject', { to: from, conversationId });
          return;
        }
        callInfoRef.current = { conversationId, otherUserId: from };
        setPeerInfo({ userId: from, name: fromName || 'Unknown', avatar: fromAvatar || null });
        setCallType(ct === 'video' ? 'video' : 'voice');
        setCallState('ringing');
      },
      'call-accepted': async ({ from }) => {
        if (callState !== 'calling') return;
        setCallState('connecting');
        try {
          const pc = createPeerConnection(from);
          pcRef.current = pc;
          localStreamRef.current?.getTracks().forEach(t => pc.addTrack(t, localStreamRef.current));
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          emitRef.current('call-offer', { to: from, conversationId: callInfoRef.current?.conversationId, sdp: pc.localDescription });
        } catch (err) {
          console.error('[Call] Failed to create offer:', err?.message);
          closeCall();
        }
      },
      'call-rejected': () => { toast.error('Call declined'); closeCall(); },
      'call-ended':    () => { closeCall(); },
      'call-offer': async ({ from, sdp }) => {
        const pc = pcRef.current;
        if (!pc) return;
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          await flushPendingCandidates(pc);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          emitRef.current('call-answer', { to: from, conversationId: callInfoRef.current?.conversationId, sdp: pc.localDescription });
        } catch (err) {
          console.error('[Call] Failed to answer offer:', err?.message);
          closeCall();
        }
      },
      'call-answer': async ({ sdp }) => {
        const pc = pcRef.current;
        if (!pc) return;
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          await flushPendingCandidates(pc);
        } catch (err) {
          console.error('[Call] Failed to apply answer:', err?.message);
          closeCall();
        }
      },
      'call-ice-candidate': async ({ candidate }) => {
        const pc = pcRef.current;
        if (!pc || !candidate) return;
        if (pc.remoteDescription?.type) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
        } else {
          pendingCandidatesRef.current.push(candidate);
        }
      },
    },
  });
  emitRef.current = emit;

  // Release mic/camera and close the peer connection if the user logs out mid-call
  useEffect(() => () => closeCall(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const startCall = async (toUserId, conversationId, type, peer) => {
    if (!toUserId || !conversationId || callState) return;
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: type === 'video' });
    } catch (err) {
      console.error('[Call] getUserMedia failed:', err?.message);
      toast.error('Camera/microphone permission is required to start a call');
      return;
    }
    localStreamRef.current = stream;
    setLocalStream(stream);
    callInfoRef.current = { conversationId, otherUserId: toUserId };
    setPeerInfo({ userId: toUserId, name: peer?.name || 'User', avatar: peer?.avatar || null });
    setCallType(type);
    setCallState('calling');
    emit('call-start', {
      to: toUserId,
      callType: type,
      conversationId,
      fromName: myDisplayName(user),
      fromAvatar: myAvatar(user),
    });
  };

  const rejectCall = () => {
    const info = callInfoRef.current;
    if (info) emit('call-reject', { to: info.otherUserId, conversationId: info.conversationId });
    closeCall();
  };

  const endCall = () => {
    if (callState === 'ringing') { rejectCall(); return; }
    const info = callInfoRef.current;
    if (info) emit('call-end', { to: info.otherUserId, conversationId: info.conversationId });
    closeCall();
  };

  const acceptCall = async () => {
    const info = callInfoRef.current;
    if (!info) return;
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: callType === 'video' });
    } catch (err) {
      console.error('[Call] getUserMedia failed:', err?.message);
      toast.error('Camera/microphone permission is required to answer this call');
      rejectCall();
      return;
    }
    localStreamRef.current = stream;
    setLocalStream(stream);
    const pc = createPeerConnection(info.otherUserId);
    pcRef.current = pc;
    stream.getTracks().forEach(t => pc.addTrack(t, stream));
    setCallState('connecting');
    emit('call-accept', { to: info.otherUserId, conversationId: info.conversationId });
  };

  return (
    <CallContext.Provider value={{ callState, startCall }}>
      {children}
      {callType && callState && (
        <CallOverlay
          callType={callType}
          callState={callState}
          otherName={peerInfo?.name || ''}
          otherAvatar={peerInfo?.avatar}
          onEnd={endCall}
          onAccept={acceptCall}
          localStream={localStream}
          remoteStream={remoteStream}
        />
      )}
    </CallContext.Provider>
  );
}

CallProvider.propTypes = { children: PropTypes.node.isRequired };

export const useCallContext = () => {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCallContext must be inside CallProvider');
  return ctx;
};
