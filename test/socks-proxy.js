// Credits to chbrown @ https://github.com/chbrown/socks-server

const net = require('net');

function formatIPv4(buffer) {
  // buffer.length == 4
  return buffer[0] + '.' + buffer[1] + '.' + buffer[2] + '.' + buffer[3];
}

function formatIPv6(buffer) {
  // buffer.length == 16
  var parts = [];
  for (var i = 0; i < 16; i += 2) {
    parts.push(buffer.readUInt16BE(i).toString(16));
  }
  return parts.join(':');
}

/**
Returns an object with three properties designed to look like the address
returned from socket.address(), e.g.:

    { family: 'IPv4', address: '127.0.0.1', port: 12346 }
    { family: 'IPv6', address: '1404:abf0:c984:ed7d:110e:ea59:69b6:4490', port: 8090 }
    { family: 'domain', address: '1404:abf0:c984:ed7d:110e:ea59:69b6:4490', port: 8090 }

The given `type` should be either 1, 3, or 4, and the `buffer` should be
formatted according to the SOCKS5 specification.
*/
function readAddress(type, buffer) {
  if (type == 1) {
    // IPv4 address
    return {
      family: 'IPv4',
      address: formatIPv4(buffer),
      port: buffer.readUInt16BE(4),
    };
  }
  else if (type == 3) {
    // Domain name
    var length = buffer[0];
    return {
      family: 'domain',
      address: buffer.slice(1, length + 1).toString(),
      port: buffer.readUInt16BE(length + 1),
    };
  }
  else if (type == 4) {
    // IPv6 address
    return {
      family: 'IPv6',
      address: formatIPv6(buffer),
      port: buffer.readUInt16BE(16),
    };
  }
}

const authMethod = {
  NO_AUTHENT: 0x00,
  USERNAME_PASSWORD: 0x02
}

const server = net.createServer((socket) => {
  socket.once('data', (greeting) => {
    // greeting = [socks_version, supported_authentication_methods,
    //             ...supported_authentication_method_ids]
    const socks_version = greeting[0];
    if (socks_version === 4) {
      let response = 0x5a;
      // username verification only
      if(greeting.length > 9) {
        const username = greeting.slice(8, greeting.length).toString();
        response = username === 'toto' ? 0x5a : 0x5b;
      }
      const address = {
        port: greeting.slice(2, 4).readUInt16BE(0),
        address: formatIPv4(greeting.slice(4)),
      };
      net.connect(address.port, address.address, function () {
        let socket = this;
        // the socks response must be made after the remote connection has been
        // established
        //socket.pipe(this).pipe(socket);
        socket.write(Buffer.from([0, response, 0, 0, 0, 0, 0, 0]));
      });
    }
    else if (socks_version === 5) {
      const methods = greeting.slice(2, greeting.length);
      const authent = methods.length >= 2
      if (authent) {
        socket.write(Buffer.from([5, authMethod.USERNAME_PASSWORD]));
        socket.once('data', authentSocksV5);
      } else {
        socket.write(Buffer.from([5, authMethod.NO_AUTHENT]));
        socket.once('data', requestHandlerSocksV5);
      }
    }
  })
    .on('error', function (err) {
      console.error('socket error: %s', err.message);
    });
})
  .on('error', function (err) {
    console.error('server error: %j', err);
  });

const authentSocksV5 = function (userPass) {
  let socket = this;
  const username = userPass.slice(2, userPass[1] + 2).toString();
  const password = userPass.slice(userPass[1] + 3).toString();
  if (username === 'toto' && password === 'tata') {
    socket.write(Buffer.from([5, 0x00]));
  } else {
    socket.write(Buffer.from([5, 0x01]));
  }
  socket.once('data', requestHandlerSocksV5);
};

const requestHandlerSocksV5 = function (connection) {
  let socket = this;
  const address_type = connection[3];
  const address = readAddress(address_type, connection.slice(4));
  net.connect(address.port, address.address, function () {
    socket.pipe(this).pipe(socket);
    const response = Buffer.from(connection);
    response[1] = 0;
    socket.write(response);
  });
}

function create() {
  return new Promise(resolve => {
    server.listen(() => {
      resolve(server.address().port);
    })
  })
}

function close() {
  server.close();
}

module.exports = {
  create,
  close
}