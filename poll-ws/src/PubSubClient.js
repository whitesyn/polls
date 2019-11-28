const { PubSub } = require('@google-cloud/pubsub');

function noop() {}

class PubSubClient {
  /**
   * PubSubClient Constructor.
   * @throws {Error} If a subscription name is not provided.
   * @throws {Error} If a topic name is not provided.
   *
   * @param {string} subscription PubSub Subscription name.
   * @param {string} topic PubSub Topic to subscribe.
   *
   * @returns PubSubClient
   */
  constructor(subscription, topic) {
    if (!subscription) {
      throw new Error('Provide subscription name for the PubSub');
    }
    if (!topic) {
      throw new Error('Provide topic name for the PubSub');
    }

    this.subscription = subscription;
    this.topic = topic;

    this._pubsub = new PubSub();

    this._subscription = null;
    try {
      this._subscription = this._pubsub.subscription(subscription, {
        topic: topic
      });
    } catch (e) {
      // Create subscription
      pubsub
        .topic(topicName)
        .createSubscription(subscriptionName)
        .then(
          () => {
            this._subscription = this._pubsub.subscription(subscription, {
              topic: topic
            });
          },
          () => {}
        );
    }
  }

  /**
   * Subscribe on topic messages.
   *
   * @param {Function} handler Subscription message handler function.
   * @param {Function} [errorHandler=noop] Subscription errors handler function.
   * @returns {Function} Function to un-subscribe from topic messages.
   */
  subscribe(handler, errorHandler = noop) {
    this._subscription.on('message', handler);
    this._subscription.on(`error`, errorHandler);

    return () => {
      this._subscription.removeListener('message', handler);
      this._subscription.removeListener('error', errorHandler);
    };
  }
}

module.exports = PubSubClient;
