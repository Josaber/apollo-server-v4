# Subscription (WebSocket)

> Apollo Server does not provide built-in support for subscriptions.

Subscriptions are **long-lasting GraphQL read operations** that can update their result whenever a particular server-side event occurs. Most commonly, updated results are pushed from the server to subscribing clients.

## Production

- https://www.apollographql.com/docs/apollo-server/data/subscriptions#production-pubsub-libraries
- Solace
- Redis
- Google PubSub
- MQTT enabled broker
- RabbitMQ
- AMQP (RabbitMQ)
- Kafka
- Postgres
- Google Cloud Firestore
- Ably Realtime
- Google Firebase Realtime Database
- Azure SignalR Service
- Azure ServiceBus
- MongoDB

## Migration

- https://www.apollographql.com/docs/apollo-server/data/subscriptions#switching-from-subscriptions-transport-ws
