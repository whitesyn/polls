const logger = require('./src/Logger');
const PubSubClient = require('./src/PubSubClient');
const WebSocketServer = require('./src/WebSocketServer');
const cleanupOnExit = require('./src/CleanupOnExit');

const PUBSUB_SUBSCRIPTION_NAME = process.env.PUBSUB_SUBSCRIPTION_NAME;
const PUBSUB_TOPIC = process.env.PUBSUB_TOPIC;
const pubsub = new PubSubClient(PUBSUB_SUBSCRIPTION_NAME, PUBSUB_TOPIC);

const PORT = process.env.PORT;
const wss = new WebSocketServer(PORT, logger);

const serverStartTs = Date.now();

const unsubscribeFromPubSub = pubsub.subscribe(
  message => {
    logger.info(`Received message ${message.id}: ${message.data}`);

    message.ack();

    let data = message.data.toString();
    // broadcast messages that happened only after server startup
    if (!data.timestamp || timestamp > serverStartTs) {
      wss.broadcast(data);
    }
  },
  e => {
    logger.error(`PubSub subscription error: ${e}`);
  }
);

cleanupOnExit(() => {
  logger.info('Shutting down...');
  
  unsubscribeFromPubSub();
  wss.closeConnections();
}, logger);
