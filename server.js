const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 8080;

const app = express();

// Set server
const httpServer = http.createServer(app);
const socketIOserver = new Server(httpServer, {
  cors: {
    origins: "http://localhost:3000/",
    // origins: "https://medical-appointment.vercel.app/",
    methods: ["GET", "POST"],
  }
});

socketIOserver.on("connection", (socket) => {
  // Testing wsSocket connection.
  socket.on("clicked", (payload) => {
    console.log(payload, 'by', socket.id);
    socketIOserver.sockets.emit("roomUpdate", showPublicRooms());
  });

  // Join or create a room.
  socket.on("joinRoom", (loginData) => {
    socket["nickname"] = loginData.user_name;

    if(countRoomMembers(loginData.room_name) >= 2) {
      // Send a message that the room is full to the client.
      socket.emit("roomFull", `The room, ${loginData.room_name} is full.`);
      return;
    }

    if(countParticipatingRooms(socket) >= 2) {
      socket.emit("duplicatedJoin", `You are already participating in another room.`);
      return;
    }

    socket.join(loginData.room_name);
    socketIOserver.sockets.emit("roomUpdate", showPublicRooms());
  });

  socket.on("disconnect", () => {
    socket.disconnect(true);
    socketIOserver.sockets.emit("roomUpdate", showPublicRooms());
  });
});

httpServer.listen(PORT, () => console.log('Activated the server. '+PORT));

// Utility Functions
const findRoom = (roomName) => {
  const {
    sockets: {
      adapter: {rooms},
    },
  } = socketIOserver;

  return rooms.get(roomName) !== undefined;
}

const countRoomMembers = (roomName) => {
  return socketIOserver.sockets.adapter.rooms.get(roomName)?.size;
}

const countParticipatingRooms = (socket) => {
  return socket.rooms.size;
}

const showPublicRooms = () => {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = socketIOserver;

  const { sockets: {
    adapter
  }} = socketIOserver;
  
  const publicRooms = [];
  rooms.forEach((value, key) => {
    console.log(adapter);
    if (sids.get(key) === undefined) {
      const publicRoom = {roomName: key, participants: value.size}
      publicRooms.push(publicRoom);
    }
  })

  return publicRooms;
}


// Socket {
//   _events: [Object: null prototype] { clicked: [Function (anonymous)] },
//   _eventsCount: 1,
//   _maxListeners: undefined,
//   nsp: <ref *2> Namespace {
//     _events: [Object: null prototype] { connection: [Function (anonymous)] },
//     _eventsCount: 1,
//     _maxListeners: undefined,
//     sockets: Map(2) {
//       'uGhIshYwTPDpAvxcAAAB' => [Socket],
//       'FaZeQaNvaSNsdlYvAAAD' => [Circular *1]
//     },
//     _fns: [],
//     _ids: 0,
//     server: Server {
//       _events: [Object: null prototype] {},
//       _eventsCount: 0,
//       _maxListeners: undefined,
//       _nsps: [Map],
//       parentNsps: Map(0) {},
//       _path: '/socket.io',
//       clientPathRegex: /^\/socket\.io\/socket\.io(\.msgpack|\.esm)?(\.min)?\.js(\.map)?(?:\?|$)/,
//       _connectTimeout: 45000,
//       _serveClient: true,
//       _parser: [Object],
//       encoder: Encoder {},
//       _adapter: [class Adapter extends EventEmitter],
//       sockets: [Circular *2],
//       opts: [Object],
//       eio: [Server],
//       httpServer: [Server],
//       engine: [Server],
//       [Symbol(kCapture)]: false
//     },
//     name: '/',
//     adapter: Adapter {
//       _events: [Object: null prototype] {},
//       _eventsCount: 0,
//       _maxListeners: undefined,
//       nsp: [Circular *2],
//       rooms: [Map],
//       sids: [Map],
//       encoder: Encoder {},
//       [Symbol(kCapture)]: false
//     },
//     [Symbol(kCapture)]: false
//   },
//   client: Client {
//     sockets: Map(1) { 'FaZeQaNvaSNsdlYvAAAD' => [Circular *1] },
//     nsps: Map(1) { '/' => [Circular *1] },
//     server: Server {
//       _events: [Object: null prototype] {},
//       _eventsCount: 0,
//       _maxListeners: undefined,
//       _nsps: [Map],
//       parentNsps: Map(0) {},
//       _path: '/socket.io',
//       clientPathRegex: /^\/socket\.io\/socket\.io(\.msgpack|\.esm)?(\.min)?\.js(\.map)?(?:\?|$)/,
//       _connectTimeout: 45000,
//       _serveClient: true,
//       _parser: [Object],
//       encoder: Encoder {},
//       _adapter: [class Adapter extends EventEmitter],
//       sockets: [Namespace],
//       opts: [Object],
//       eio: [Server],
//       httpServer: [Server],
//       engine: [Server],
//       [Symbol(kCapture)]: false
//     },
//     conn: Socket {
//       _events: [Object: null prototype],
//       _eventsCount: 3,
//       _maxListeners: undefined,
//       id: 'yzTcrvX2S96JYuhcAAAC',
//       server: [Server],
//       upgrading: false,
//       upgraded: true,
//       _readyState: 'open',
//       writeBuffer: [],
//       packetsFn: [],
//       sentCallbackFn: [],
//       cleanupFn: [Array],
//       request: [IncomingMessage],
//       protocol: 4,
//       remoteAddress: '::1',
//       checkIntervalTimer: null,
//       upgradeTimeoutTimer: null,
//       pingTimeoutTimer: Timeout {
//         _idleTimeout: 45000,
//         _idlePrev: [TimersList],
//         _idleNext: [TimersList],
//         _idleStart: 4340,
//         _onTimeout: [Function (anonymous)],
//         _timerArgs: undefined,
//         _repeat: null,
//         _destroyed: false,
//         [Symbol(refed)]: true,
//         [Symbol(kHasPrimitive)]: false,
//         [Symbol(asyncId)]: 121,
//         [Symbol(triggerId)]: 89
//       },
//       pingIntervalTimer: Timeout {
//         _idleTimeout: 25000,
//         _idlePrev: [TimersList],
//         _idleNext: [Timeout],
//         _idleStart: 2300,
//         _onTimeout: [Function (anonymous)],
//         _timerArgs: undefined,
//         _repeat: null,
//         _destroyed: false,
//         [Symbol(refed)]: true,
//         [Symbol(kHasPrimitive)]: false,
//         [Symbol(asyncId)]: 70,
//         [Symbol(triggerId)]: 0
//       },
//       transport: [WebSocket],
//       [Symbol(kCapture)]: false
//     },
//     encoder: Encoder {},
//     decoder: Decoder { _callbacks: [Object] },
//     id: 'yzTcrvX2S96JYuhcAAAC',
//     onclose: [Function: bound onclose],
//     ondata: [Function: bound ondata],
//     onerror: [Function: bound onerror],
//     ondecoded: [Function: bound ondecoded],
//     connectTimeout: undefined
//   },
//   data: {},
//   connected: true,
//   acks: Map(0) {},
//   fns: [],
//   flags: {},
//   server: <ref *3> Server {
//     _events: [Object: null prototype] {},
//     _eventsCount: 0,
//     _maxListeners: undefined,
//     _nsps: Map(1) { '/' => [Namespace] },
//     parentNsps: Map(0) {},
//     _path: '/socket.io',
//     clientPathRegex: /^\/socket\.io\/socket\.io(\.msgpack|\.esm)?(\.min)?\.js(\.map)?(?:\?|$)/,
//     _connectTimeout: 45000,
//     _serveClient: true,
//     _parser: {
//       protocol: 5,
//       PacketType: [Object],
//       Encoder: [class Encoder],
//       Decoder: [class Decoder extends Emitter]
//     },
//     encoder: Encoder {},
//     _adapter: [class Adapter extends EventEmitter],
//     sockets: <ref *2> Namespace {
//       _events: [Object: null prototype],
//       _eventsCount: 1,
//       _maxListeners: undefined,
//       sockets: [Map],
//       _fns: [],
//       _ids: 0,
//       server: [Circular *3],
//       name: '/',
//       adapter: [Adapter],
//       [Symbol(kCapture)]: false
//     },
//     opts: { cors: [Object] },
//     eio: Server {
//       _events: [Object: null prototype],
//       _eventsCount: 1,
//       _maxListeners: undefined,
//       clients: [Object],
//       clientsCount: 2,
//       opts: [Object],
//       corsMiddleware: [Function: corsMiddleware],
//       ws: [WebSocketServer],
//       [Symbol(kCapture)]: false
//     },
//     httpServer: Server {
//       maxHeaderSize: undefined,
//       insecureHTTPParser: undefined,
//       _events: [Object: null prototype],
//       _eventsCount: 5,
//       _maxListeners: undefined,
//       _connections: 4,
//       _handle: [TCP],
//       _usingWorkers: false,
//       _workers: [],
//       _unref: false,
//       allowHalfOpen: true,
//       pauseOnConnect: false,
//       noDelay: false,
//       keepAlive: false,
//       keepAliveInitialDelay: 0,
//       httpAllowHalfOpen: false,
//       timeout: 0,
//       keepAliveTimeout: 5000,
//       maxHeadersCount: null,
//       maxRequestsPerSocket: 0,
//       headersTimeout: 60000,
//       requestTimeout: 0,
//       _connectionKey: '6::::8080',
//       [Symbol(IncomingMessage)]: [Function: IncomingMessage],
//       [Symbol(ServerResponse)]: [Function: ServerResponse],
//       [Symbol(kCapture)]: false,
//       [Symbol(async_id_symbol)]: 4
//     },
//     engine: Server {
//       _events: [Object: null prototype],
//       _eventsCount: 1,
//       _maxListeners: undefined,
//       clients: [Object],
//       clientsCount: 2,
//       opts: [Object],
//       corsMiddleware: [Function: corsMiddleware],
//       ws: [WebSocketServer],
//       [Symbol(kCapture)]: false
//     },
//     [Symbol(kCapture)]: false
//   },
//   adapter: <ref *4> Adapter {
//     _events: [Object: null prototype] {},
//     _eventsCount: 0,
//     _maxListeners: undefined,
//     nsp: <ref *2> Namespace {
//       _events: [Object: null prototype],
//       _eventsCount: 1,
//       _maxListeners: undefined,
//       sockets: [Map],
//       _fns: [],
//       _ids: 0,
//       server: [Server],
//       name: '/',
//       adapter: [Circular *4],
//       [Symbol(kCapture)]: false
//     },
//     rooms: Map(2) {
//       'uGhIshYwTPDpAvxcAAAB' => [Set],
//       'FaZeQaNvaSNsdlYvAAAD' => [Set]
//     },
//     sids: Map(2) {
//       'uGhIshYwTPDpAvxcAAAB' => [Set],
//       'FaZeQaNvaSNsdlYvAAAD' => [Set]
//     },
//     encoder: Encoder {},
//     [Symbol(kCapture)]: false
//   },
//   id: 'FaZeQaNvaSNsdlYvAAAD',
//   handshake: {
//     headers: {
//       host: 'localhost:8080',
//       connection: 'keep-alive',
//       'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
//       accept: '*/*',
//       'sec-ch-ua-mobile': '?0',
//       'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
//       'sec-ch-ua-platform': '"macOS"',
//       origin: 'http://localhost:3000',
//       'sec-fetch-site': 'same-site',
//       'sec-fetch-mode': 'cors',
//       'sec-fetch-dest': 'empty',
//       referer: 'http://localhost:3000/',
//       'accept-encoding': 'gzip, deflate, br',
//       'accept-language': 'en-US,en;q=0.9,ko-KR;q=0.8,ko;q=0.7,ja-JP;q=0.6,ja;q=0.5'
//     },
//     time: 'Sat Jul 02 2022 13:36:16 GMT+0900 (Japan Standard Time)',
//     address: '::1',
//     xdomain: true,
//     secure: false,
//     issued: 1656736576274,
//     url: '/socket.io/?EIO=4&transport=polling&t=O6zCVC4',
//     query: [Object: null prototype] {
//       EIO: '4',
//       transport: 'polling',
//       t: 'O6zCVC4'
//     },
//     auth: {}
//   },
//   nickname: 'Anon',
//   [Symbol(kCapture)]: false
// }

// Adapter {
//   _events: [Object: null prototype] {},
//   _eventsCount: 0,
//   _maxListeners: undefined,
//   nsp: <ref *1> Namespace {
//     _events: [Object: null prototype] { connection: [Function (anonymous)] },
//     _eventsCount: 1,
//     _maxListeners: undefined,
//     sockets: Map(2) {
//       'PjJm5JVPbsDzGGeiAAAB' => [Socket],
//       'LSQ-yVwFigS8QUM6AAAH' => [Socket]
//     },
//     _fns: [],
//     _ids: 0,
//     server: Server {
//       _events: [Object: null prototype] {},
//       _eventsCount: 0,
//       _maxListeners: undefined,
//       _nsps: [Map],
//       parentNsps: Map(0) {},
//       _path: '/socket.io',
//       clientPathRegex: /^\/socket\.io\/socket\.io(\.msgpack|\.esm)?(\.min)?\.js(\.map)?(?:\?|$)/,
//       _connectTimeout: 45000,
//       _serveClient: true,
//       _parser: [Object],
//       encoder: Encoder {},
//       _adapter: [class Adapter extends EventEmitter],
//       sockets: [Circular *1],
//       opts: [Object],
//       eio: [Server],
//       httpServer: [Server],
//       engine: [Server],
//       [Symbol(kCapture)]: false
//     },
//     name: '/',
//     adapter: [Circular *2],
//     [Symbol(kCapture)]: false
//   },
//   rooms: Map(2) {
//     'PjJm5JVPbsDzGGeiAAAB' => Set(1) { 'PjJm5JVPbsDzGGeiAAAB' },
//     'LSQ-yVwFigS8QUM6AAAH' => Set(1) { 'LSQ-yVwFigS8QUM6AAAH' }
//   },
//   sids: Map(2) {
//     'PjJm5JVPbsDzGGeiAAAB' => Set(1) { 'PjJm5JVPbsDzGGeiAAAB' },
//     'LSQ-yVwFigS8QUM6AAAH' => Set(1) { 'LSQ-yVwFigS8QUM6AAAH' }
//   },
//   encoder: Encoder {},
//   [Symbol(kCapture)]: false
// }