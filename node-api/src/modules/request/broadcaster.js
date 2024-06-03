const dgram = require('dgram');
const EventEmitter = require('events');

const DEFAULT_PORT = 4445;
const ALL_INTERFACES_ADDR = "0.0.0.0";
const BROADCAST_ADDR = "255.255.255.255";


class Broadcaster extends EventEmitter {
  constructor (port, address) {
    super()
    if (port == null || isNaN(port)) {
      this.port = DEFAULT_PORT;
    } else {
      this.port = port;
    }
    this.ipAddress = address;
    this.listeningSocket = null;
    this.broadcastSockets = [];
    this.boundAddresses = [];
  }
  listen (completion) {
    var self = this

    if (self.listeningSocket) {
      self.listeningSocket.close();
    }

    self.listeningSocket = dgram.createSocket({type: "udp4", reuseAddr: true});

    self.listeningSocket.on('message', (msg, rinfo) => {
      if (completion == null) {
        self.emit('message', rinfo.address, String(msg))
      } else {
        completion(rinfo.address, String(msg))
      }
    });

    self.listeningSocket.bind({
        address: this.ipAddress,
        port: self.port,
    }, function() {
      self.listeningSocket.setBroadcast(true);
    });

    // console.log(`Listening to: ${ALL_INTERFACES_ADDR}:${self.port}`);
  }
  setupBroadcasting () {
    var self = this;

    self.bindToAddress(ALL_INTERFACES_ADDR);
  }
  bindToAddress (address) {
    var self = this;

    if (self.boundAddresses.includes(address)) {
      return;
    }


    self.boundAddresses.push(address);
    var socket = dgram.createSocket({type: "udp4", reuseAddr: true});
    // console.log(`Binding to ${address}`);
    socket.bind(self.port, address, function() {
      socket.setBroadcast(true);
    });
    self.broadcastSockets.push(socket);
  }
  broadcast(message, ipAddress, andthen) {
    var self = this;

    if (message == null) {
      message = "";
    }
    if(ipAddress === undefined){
        ipAddress = BROADCAST_ADDR;
    }
    self.broadcastSockets.forEach(function (socket) {
      //var buffer = new Buffer(message)
      let buffer = Buffer.alloc(1000);
      buffer[0] = message;
      //console.log(buffer);
      socket.send(buffer, 0, buffer.length, self.port, ipAddress, function (err) {
          if(err !== null){
              return false;
          }
          if (andthen != null) {
              console.log(andthen);
              andthen()
          }
      })
    })
  }
  broadcastBuffer(buffer, ipAddress, andthen) {
    var self = this;

    if(ipAddress === undefined){
        ipAddress = BROADCAST_ADDR;
    }
    self.broadcastSockets.forEach(function (socket) {
      //socket.send(buffer, 0, buffer.length, 4446, BROADCAST_ADDR, function (err) {
      socket.send(buffer, 0, buffer.length, self.port, ipAddress, function (err) {
          if(err !== null){
              return false;
          }
          if (andthen != null) {
              console.log(andthen);
              andthen()
          }
      })
    })
  }
  endBroadcast () {
    this.broadcastSockets.forEach(function (socket) {
      socket.close();
    });
  }
}

module.exports = Broadcaster;
