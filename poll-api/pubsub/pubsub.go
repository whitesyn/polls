package pubsub

import (
	"context"
	"log"

	"cloud.google.com/go/pubsub"
)

// PubSub structure
type PubSub struct {
	client *pubsub.Client
	topic *pubsub.Topic
}

// Init PubSub
func (p *PubSub) Init(projectID string, topicName string) error {
	ctx := context.Background()
	client, err := pubsub.NewClient(ctx, projectID)

	if err != nil {
		return err
	}

	topic := client.Topic(topicName)

	// Create the topic if it doesn't exist.
	exists, err := topic.Exists(ctx)
	if err != nil {
		return err
	}

	if !exists {
		log.Printf("Topic %v doesn't exist - creating it", topicName)
		_, err = client.CreateTopic(ctx, topicName)
		if err != nil {
			return err
		}
	}

	p.client = client
	p.topic = topic;

	return nil
}

// PublishEvent method
func (p *PubSub) PublishEvent(data []byte) error {
	ctx := context.Background()
	msg := &pubsub.Message{
		Data: data,
	}

	if _, err := p.topic.Publish(ctx, msg).Get(ctx); err != nil {
		return err;
	}

	return nil
}