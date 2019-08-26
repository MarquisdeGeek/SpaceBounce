const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io').listen(server);

const arduino = require('arduino-controller');

server.listen(3000, function() {
  console.log('Express server listening...');
});

app.use('/', express.static('app'));

const five = require("johnny-five");
const board = new five.Board({
  repl: false
});

board.on("ready", function() {
  let green = new five.Led(5);
  let red = new five.Led(6);
  let left = new five.Pin(2);
  let right = new five.Pin(3);

  io.on('connect', function(socket) {
    console.log('We are connected!');
    let lastLeft = false;
    let lastRight = false;

    five.Pin.read(left, (err, val) => {
      if (val) {
        green.on();
      } else {
        green.off();
      }

      if (val !== lastLeft) {
        lastLeft = val;
        let state = {
          side: 'left',
          state: val ? 'down' : 'up'
        }
        socket.emit('arduino::state', JSON.stringify(state), {
          for: 'everyone'
        });
      }

    })

    five.Pin.read(right, (err, val) => {
      if (val) {
        red.on();
      } else {
        red.off();
      }
      //
      if (val !== lastRight) {
        lastRight = val;
        let state = {
          side: 'right',
          state: val ? 'down' : 'up'
        }
        socket.emit('arduino::state', JSON.stringify(state), {
          for: 'everyone'
        });

      }
    })
  });

});