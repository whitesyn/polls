# Polls Service

Realtime Polls service. 


## Services

- `poll-api` - golang Rest API service. Stores and edit polls in database. Pubslish API events to PubSub. 
- `poll-ws` - NodeJS WebSocket subscription service. Listens for PubSub events and broadcast messages to clients.
- `poll-ui` - ReactJS app to work with polls.
- `pubsub` - Google PubSub emulator
- `datastore` - MongoDB database
- `traefik` - Open-source reverse proxy and load balancer. Handles BasicAuth, routing, services.


## Authorization

`BasicAuth` is used for this project. Users are defined in `users.txt` file.

Predifened users:

```
test password
test2 password2
test3 password3
test4 password4
```

To add new user (tested on MacOS):
- Run `htpasswd -b -n <username> <password>`
- Add result in `users.txt`

## Run locally

- Instal Docker
- Run `docker-compose up`
- Open [http://poll.docker.localhost/](http://poll.docker.localhost/) in your browser
