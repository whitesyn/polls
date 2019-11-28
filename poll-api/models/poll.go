package models

import "gopkg.in/mgo.v2/bson"

// Poll entity structure
type Poll struct {
	ID          bson.ObjectId       `bson:"_id" json:"id"`
	Title       string              `bson:"title" json:"title"`
	Description string              `bson:"description" json:"description"`
	CreatedAt	int64 				`bson:"createdAt" json:"createdAt"`
	UpdatedAt	int64 				`bson:"updatedAt" json:"updatedAt"`
	User		string 				`bson:"user" json:"user"`
	Votes       map[string]float32  `bson:"votes" json:"votes,omitempty"`
}
