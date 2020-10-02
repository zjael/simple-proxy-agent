const http = require('http');
const net = require('net');
const url = require('url');

const server = http.createServer((req, res) => {
  const options = {
    method: req.method,
    headers: req.headers
  };

  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  const data = http.request(req.url, options, (response) => {
    response.setEncoding('utf8');
    res.writeHead(response.statusCode, response.headers);

    response.on('data', (chunk) => {
      res.write(chunk);
    });
    response.on('close', () => {
      res.end();
    });
    response.on('end', () => {
      res.end();
    });
  }).on('error', (err) => {
    res.writeHead(500);
    res.end();
  });

  req.on('end', () => {
    data.write(body);
    data.end();
  })
});

server.on('connect', (req, clientSocket, head) => {
  let parsed = url.parse(`http://${req.url}`);
  if (+parsed.port === 443) parsed = url.parse(`https://${req.url}`);
  //check authorization
  let authorizationOk = true
  const authorization = req.headers.authorization;
  if (authorization !== undefined) {
    authorizationOk = authorization === 'Basic ' + Buffer.from('toto:tata', 'utf-8').toString('base64');
  }

  const serverSocket = net.connect(parsed.port, parsed.hostname, () => {
    if (authorizationOk) {
      clientSocket.write('HTTP/1.1 200 Connection Established\r\n' +
        'Proxy-agent: NodeJS-Proxy\r\n' +
        '\r\n');
    } else {
      clientSocket.write('HTTP/1.1 401 Unauthorized\r\n' +
        'Proxy-agent: NodeJS-Proxy\r\n' +
        '\r\n');
        throw new Error("unauthorized");
    }
    serverSocket.write(head);
    serverSocket.pipe(clientSocket);
    clientSocket.pipe(serverSocket);
  });

  const errorHandler = (err) => {
    if (serverSocket) serverSocket.end();
  }

  clientSocket.on('error', errorHandler)
  clientSocket.on('end', errorHandler)
  serverSocket.on('error', errorHandler)
  serverSocket.on('end', errorHandler)
});

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