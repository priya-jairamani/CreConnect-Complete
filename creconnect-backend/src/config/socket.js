const { Server } = require('socket.io');
const { FRONTEND_URL } = require('./env');
const { verifyAccessToken } = require('../utils/jwt');
const logger = require('../utils/logger');

let io;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: FRONTEND_URL, credentials: true },
    transports: ['websocket', 'polling'],
  });

  // Auth middleware — attach user to socket
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      socket.user = verifyAccessToken(token);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  const notifications = io.of('/notifications');

  notifications.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      socket.user = verifyAccessToken(token);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  notifications.on('connection', (socket) => {
    const userId = socket.user.id;
    socket.join(`user:${userId}`);
    logger.info(`Socket connected: ${userId}`);

    // ── Call signaling (relay-only; server never inspects SDP/candidates) ──
    // Lives on this namespace (not /chat) because it's connected app-wide as
    // soon as the user logs in, so a call rings even if Messages isn't open.
    const relayToUser = (targetUserId, event, payload) => {
      notifications.to(`user:${targetUserId}`).emit(event, payload);
    };

    socket.on('call-start', ({ to, callType, conversationId, fromName, fromAvatar }) => {
      relayToUser(to, 'call-incoming', { from: userId, callType, conversationId, fromName, fromAvatar });
    });

    socket.on('call-accept', ({ to, conversationId }) => {
      relayToUser(to, 'call-accepted', { from: userId, conversationId });
    });

    socket.on('call-reject', ({ to, conversationId }) => {
      relayToUser(to, 'call-rejected', { from: userId, conversationId });
    });

    socket.on('call-end', ({ to, conversationId }) => {
      relayToUser(to, 'call-ended', { from: userId, conversationId });
    });

    socket.on('call-offer', ({ to, conversationId, sdp }) => {
      relayToUser(to, 'call-offer', { from: userId, conversationId, sdp });
    });

    socket.on('call-answer', ({ to, conversationId, sdp }) => {
      relayToUser(to, 'call-answer', { from: userId, conversationId, sdp });
    });

    socket.on('call-ice-candidate', ({ to, conversationId, candidate }) => {
      relayToUser(to, 'call-ice-candidate', { from: userId, conversationId, candidate });
    });

    socket.on('disconnect', () => logger.info(`Socket disconnected: ${userId}`));
  });

  // ── Chat namespace ─────────────────────────────────────────────────────────
  const chat = io.of('/chat');

  // userId → Set of socketIds (handles multiple tabs / devices)
  const onlineUsers = new Map();
  // userId → ISO last-seen timestamp (updated on disconnect)
  const lastSeenMap = new Map();

  chat.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      socket.user = verifyAccessToken(token);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  chat.on('connection', (socket) => {
    const userId = socket.user.id;
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);

    socket.on('join-conversation', (conversationId) => {
      socket.join(`conv:${conversationId}`);

      // Tell others in the room this user is online
      socket.to(`conv:${conversationId}`).emit('user-online', { userId });

      // Tell the joining user about anyone already online in this room
      // and emit last-seen for anyone who is offline
      const room = chat.adapter.rooms.get(`conv:${conversationId}`);
      if (room) {
        for (const sid of room) {
          if (sid === socket.id) continue;
          const other = chat.sockets.get(sid);
          if (other) {
            socket.emit('user-online', { userId: other.user.id });
          }
        }
      }
      // Emit last-seen for the other participants who are offline
      // (We don't know which userId is the other participant, so emit all stored lastSeen
      //  and the frontend filters by the relevant userId)
      for (const [uid, lastSeen] of lastSeenMap) {
        if (uid !== userId) {
          socket.emit('user-offline', { userId: uid, lastSeen });
        }
      }
    });

    socket.on('typing', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('typing', { conversationId, userId });
    });

    socket.on('stop-typing', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('stop-typing', { conversationId, userId });
    });

    socket.on('disconnect', () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          const lastSeen = new Date().toISOString();
          lastSeenMap.set(userId, lastSeen);       // persist last-seen
          for (const room of socket.rooms) {
            if (room.startsWith('conv:')) {
              chat.to(room).emit('user-offline', { userId, lastSeen });
            }
          }
        }
      }
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialised');
  return io;
}

function emitToUser(userId, event, data) {
  if (!io) return;
  io.of('/notifications').to(`user:${userId}`).emit(event, data);
}

function emitToConversation(conversationId, event, data) {
  if (!io) return;
  io.of('/chat').to(`conv:${conversationId}`).emit(event, data);
}

module.exports = { initSocket, getIO, emitToUser, emitToConversation };
