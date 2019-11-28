# Poll-API

Poll Rest API service. Stores and edit polls in database. Pubslish API events to PubSub. 

## Run locally

- `go build`
- `PORT=<PORT> DB_HOST=<MONGO_DB_HOST> PUBSUB_EMULATOR_HOST=<HOST> PUBSUB_PROJECT_ID=<PROJECT_ID> PUBSUB_TOPIC=<TOPIC> ./poll-api`
