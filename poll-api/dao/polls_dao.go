package dao

import (
	."github.com/whitesyn/poll/poll-api/models"
	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
	"log"
)

// PollsDAO structure
type PollsDAO struct {
	Server   string
	Database string
}

var db *mgo.Database

// COLLECTION name
const (
	COLLECTION = "polls"
)

// Connect to database
func (m *PollsDAO) Connect() {
	session, err := mgo.Dial(m.Server)
	if err != nil {
		log.Fatal(err)
	}
	session.SetMode(mgo.Monotonic, true)

	db = session.DB(m.Database)
}

// FindAll returns list of polls in database
func (m *PollsDAO) FindAll() ([]Poll, error) {
	var polls []Poll
	err := db.C(COLLECTION).Find(nil).All(&polls)
	if (polls == nil) {
		polls = make([]Poll, 0)
	}
	return polls, err
}

// FindByID returns a poll by its id
func (m *PollsDAO) FindByID(id string) (Poll, error) {
	var poll Poll
	err := db.C(COLLECTION).FindId(bson.ObjectIdHex(id)).One(&poll)
	return poll, err
}

// Insert a poll into database
func (m *PollsDAO) Insert(poll Poll) error {
	err := db.C(COLLECTION).Insert(&poll)
	return err
}

// Delete an existing poll
func (m *PollsDAO) Delete(id string) error {
	err := db.C(COLLECTION).RemoveId(bson.ObjectIdHex(id))
	return err
}

// Update an existing poll
func (m *PollsDAO) Update(id string, poll Poll) error {
	err := db.C(COLLECTION).UpdateId(bson.ObjectIdHex(id), &poll)
	return err
}
