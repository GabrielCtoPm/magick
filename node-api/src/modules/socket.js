const { Server } = require('socket.io')


function startSocketIo(server) {
  console.log('start socket io');

  const io = new Server(server, {
    cors: {
      origin: "http://localhost:8080",
    },
  })

  io.use((socket, next) => {
    if (!socket.handshake.auth.appraisalID) {
      return next(new Error('no appraisal id'))
    }

    socket.currentUser = socket.handshake.auth
    next()
  })

  io.on('connection', async socket => {
    const appraisalID = socket.currentUser.appraisalID
    console.log('a user connected', socket.currentUser.displayName, appraisalID)

    // if (!orderPages[appraisalID]) {
    //     orderPages[appraisalID] = []
    // }

    // if (!orderPages[appraisalID].find(_socket => _socket.currentUser.uid === socket.currentUser.uid)) {
    //     orderPages[appraisalID].push(socket)
    // }

    const roomName = `appraisal-${appraisalID}`
    await socket.join(roomName)

    const emitUpdate = () => {
      io.in(roomName).allSockets().then(socketIds => {
        const clients = []

        // socketIds is a Set data type
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
        for (const id of socketIds) {
          clients.push(io.sockets.sockets.get(id).currentUser)
        }

        io.to(roomName).emit('activeUsersUpdate', clients)
      })
    }

    emitUpdate()

    // remove socket from orderPages when disconnect
    socket.on('disconnect', () => {
      console.log(socket.currentUser.displayName, 'disconnect')
      emitUpdate()
    })
  })
}

module.exports.startSocketIo = startSocketIo
