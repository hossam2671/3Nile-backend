let io;
const SocketIO = require('socket.io')
module.exports = {
  init: (server) => {
     io =SocketIO(server,{
  cors: {
    methods: ['GET', 'POST'],
    allowedHeaders: ['my-custom-header'],
    credentials: true,
  }
})
    return io;
  },
  get: () => {
    if (!io) {
      throw new Error("socket is not initialized");
    }
    return io;
  }

  
};