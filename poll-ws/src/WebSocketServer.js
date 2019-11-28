const WebSocket = require('ws');

function noop() {}

const noopLogger = {
  error: noop,
  info: noop
};

class WebSocketServer {
  static CLEANUP_INTERVAL = 10000;

  /**
   * WebSocketServer Constructor.
   * @throws {Error} If a port is not provided.
   *
   * @param {Number} port Server port to run.
   * @param {Object} [logger=noopLogger] Logger object instance.
   *
   * @returns WebSocketServer
   */
  constructor(port, logger = noopLogger) {
    if (!port) {
      throw new Error('Provide port for the WebSocketServer');
    }

    this.logger = logger;

    const wss = new WebSocket.Server({ port: port });

    wss.on('connection', ws => {
      this.logger.info('Estabilished connection from user');

      ws.isAlive = true;
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('close', () => {
        this.logger.info('Closing connection');
        ws.isAlive = false;
      });
    });

    this._cleanupInterval = setInterval(() => {
      this._terminateBrokenConnections();
    }, WebSocketServer.CLEANUP_INTERVAL);

    this.wss = wss;
  }

  /**
   * Broadcast data to all connected clients.
   *
   * @param {*} data Data to send.
   *
   * @returns {void}
   */
  broadcast(data) {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  /**
   * Close all clients connections.
   *
   * @returns {void}
   */
  closeConnections() {
    clearInterval(this._cleanupInterval);

    this.wss.clients.forEach(ws => {
      ws.close();
    });
  }

  /**
   * Find and close broken clients connections.
   *
   * @returns {void}
   */
  _terminateBrokenConnections() {
    this.wss.clients.forEach(ws => {
      if (!ws.isAlive) {
        this.logger.info('Found broken connection, terminate');
        return ws.terminate();
      }

      ws.isAlive = false;
      ws.ping(noop);
    });
  }
}

module.exports = WebSocketServer;
