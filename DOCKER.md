# Docker Quick Start

This project runs as two containers:

- `api`: the Node.js/TypeScript Express server
- `mongo`: the MongoDB database

## Run Everything

```bash
docker compose up --build
```

Open the API at:

```text
http://localhost:5000
```

## Stop Everything

```bash
docker compose down
```

## Stop And Delete The MongoDB Data Volume

```bash
docker compose down --volumes
```

## How It Works

The `Dockerfile` builds the TypeScript app into JavaScript and starts it with:

```bash
npm start
```

The `docker-compose.yml` file starts MongoDB and the API together. Inside Docker,
the API connects to MongoDB with this URL:

```text
mongodb://mongo:27017/task-manager
```

`mongo` is the service name from `docker-compose.yml`. Docker turns that service
name into the correct internal network address automatically.
