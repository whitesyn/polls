package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

    "github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	. "github.com/whitesyn/poll/poll-api/dao"
	. "github.com/whitesyn/poll/poll-api/models"
	. "github.com/whitesyn/poll/poll-api/pubsub"
	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

var dao = PollsDAO{}
var pubSub = PubSub{}

// Vote entity structure
type Vote struct {
	Score float32 `json:"score"`
}

// ApiEvent entity structure
type ApiEvent struct {
	Type string  `json:"type"`
	Poll Poll    `json:"poll"`
	Id string	 `json:"id"`
}

func isValidVoteScore(score float32) bool {
	switch score {
	case
		0,
		0.5,
		1,
		2,
		3,
		5,
		8,
		13:
		return true
	}
	return false
}

func mustGetenv(k string) string {
	v := os.Getenv(k)
	if v == "" {
		log.Fatalf("%s environment variable not set.", k)
	}
	return v
}

type authenticationMiddleware struct {
	tokenUsers map[string]string
}

// Middleware function, which will be called for each request
func (amw *authenticationMiddleware) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		user := r.Header.Get("X-WebAuth-User")
		if user != "" {
			next.ServeHTTP(w, r)
		} else {
			http.Error(w, "Forbidden", http.StatusForbidden)
		}
	})
}

// GetAllPolls handler
func GetAllPolls(w http.ResponseWriter, r *http.Request) {
	polls, err := dao.FindAll()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, polls)
}

// CreatePoll handler
func CreatePoll(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	var poll Poll
	if err := json.NewDecoder(r.Body).Decode(&poll); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	poll.ID = bson.NewObjectId()
	poll.User = r.Header.Get("X-WebAuth-User")
	poll.CreatedAt = time.Now().Unix()
	poll.UpdatedAt = time.Now().Unix()

	if err := dao.Insert(poll); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	apiEvent := ApiEvent{"CREATE_POLL", poll, poll.ID.Hex()}
	event, _ := json.Marshal(apiEvent)
	if err := pubSub.PublishEvent(event); err != nil {
		log.Println("Could not publish create message: %v", err)
	}

	respondWithJSON(w, http.StatusCreated, poll)
}

// GetPoll handler
func GetPoll(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	poll, err := dao.FindByID(params["id"])
	if err != nil {
		if err == mgo.ErrNotFound {
			respondWithError(w, http.StatusNotFound, "Poll not found")
		} else {
			respondWithError(w, http.StatusBadRequest, "Invalid Poll ID")
		}
		return
	}
	respondWithJSON(w, http.StatusOK, poll)
}

// UpdatePoll handler
func UpdatePoll(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	defer r.Body.Close()

	var poll Poll
	if err := json.NewDecoder(r.Body).Decode(&poll); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	poll.UpdatedAt = time.Now().Unix()
	if err := dao.Update(params["id"], poll); err != nil {
		if err == mgo.ErrNotFound {
			respondWithError(w, http.StatusNotFound, "Poll not found")
		} else {
			respondWithError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	apiEvent := ApiEvent{"UPDATE_POLL", poll, params["id"]}
	event, _ := json.Marshal(apiEvent)
	if err := pubSub.PublishEvent(event); err != nil {
		log.Println("Could not publish update message: %v", err)
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"result": "success"})
}

// DeletePoll handler
func DeletePoll(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	defer r.Body.Close()

	if err := dao.Delete(params["id"]); err != nil {
		if err == mgo.ErrNotFound {
			respondWithError(w, http.StatusNotFound, "Poll not found")
		} else {
			respondWithError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}
	
	apiEvent := ApiEvent{"DELETE_POLL", Poll{}, params["id"]}
	event, _ := json.Marshal(apiEvent)
	if err := pubSub.PublishEvent(event); err != nil {
		log.Println("Could not publish delete message: %v", err)
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"result": "success"})
}

// PollVote handler - @TODO: handle concurency
func PollVote(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	defer r.Body.Close()

	poll, err := dao.FindByID(params["id"])
	if err != nil {
		if err == mgo.ErrNotFound {
			respondWithError(w, http.StatusNotFound, "Poll not found")
		} else {
			respondWithError(w, http.StatusBadRequest, "Invalid Poll ID")
		}
		return
	}

	var vote Vote
	if err := json.NewDecoder(r.Body).Decode(&vote); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if !isValidVoteScore(vote.Score) {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if poll.Votes == nil {
		poll.Votes = map[string]float32{}
	}

	user := r.Header.Get("X-WebAuth-User")
	poll.Votes[user] = vote.Score

	poll.UpdatedAt = time.Now().Unix()
	if err := dao.Update(params["id"], poll); err != nil {
		if err == mgo.ErrNotFound {
			respondWithError(w, http.StatusNotFound, "Poll not found")
		} else {
			respondWithError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	apiEvent := ApiEvent{"VOTE_POLL", poll, params["id"]}
	event, _ := json.Marshal(apiEvent)
	if err := pubSub.PublishEvent(event); err != nil {
		log.Println("Could not publish vote message: %v", err)
	}
	
	respondWithJSON(w, http.StatusOK, map[string]string{"result": "success"})
}

func respondWithError(w http.ResponseWriter, code int, msg string) {
	respondWithJSON(w, code, map[string]string{"error": msg})
}

func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, _ := json.Marshal(payload)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write(response)
}

func main() {
	dbHost := mustGetenv("DB_HOST")
	port := mustGetenv("PORT")
	pubSubProjectID := mustGetenv("PUBSUB_PROJECT_ID")
	pubSubTopic := mustGetenv("PUBSUB_TOPIC")
	
	if err := pubSub.Init(pubSubProjectID, pubSubTopic); err != nil {
		log.Fatalf("Could not init PubSub client: %v", err)
	}

	dao.Server = dbHost
	dao.Database = "polls"
	dao.Connect()

	r := mux.NewRouter()
	r.HandleFunc("/api/poll", GetAllPolls).Methods("GET")
	r.HandleFunc("/api/poll", CreatePoll).Methods("POST")

	r.HandleFunc("/api/poll/{id}", GetPoll).Methods("GET")
	r.HandleFunc("/api/poll/{id}", DeletePoll).Methods("DELETE")
	r.HandleFunc("/api/poll/{id}", UpdatePoll).Methods("PUT")
	r.HandleFunc("/api/poll/{id}/vote", PollVote).Methods("PUT")

	amw := authenticationMiddleware{}
	r.Use(amw.Middleware)

	if err := http.ListenAndServe(":"+port, handlers.CORS()(r)); err != nil {
		log.Fatal(err)
	}
}
