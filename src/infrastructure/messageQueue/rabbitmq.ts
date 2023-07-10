import { connect, Connection, Channel, ConsumeMessage } from 'amqplib';
import {Driver, Session} from "neo4j-driver";

export default class MessageQueue {
      connection: Connection;
      channel: Channel;
      session: Session
    constructor() {
          this.connect()
    }



    async connect(retryCount = 0): Promise<void> {
        try {
            this.connection = await connect({
                hostname: 'rabbitmq',
                port: 5672,
                username: 'guest',
                password: 'guest',
            });

            this.channel = await this.connection.createChannel();
            console.log('Connected to RabbitMQ');
        } catch (error) {
            if (retryCount < 5) {
                console.log('Failed to connect to RabbitMQ. Retrying...');
                setTimeout(() => this.connect(retryCount + 1), 3000); // Retry after 3 seconds
            } else {
                console.error('Failed to connect to RabbitMQ after multiple retries. Exiting...');
                process.exit(1);
            }
        }
    }



    async  consumeMessages(queue: any, message: any): Promise<void> {
        try {
            if (!this.channel) {
                console.error('Channel is not initialized');
                return;
            }
            await this.channel.assertQueue(queue, { durable: true });

            await this.channel.consume(queue, (message: any) => {
                if (message) {
                    const data = JSON.parse(message.content.toString());
                    // Handle different types of messages
                    switch (data.type) {
                        case 'insert':
                            this.handleInsertMessage(data.payload);
                            break;
                        case 'update':
                            this.handleUpdateMessage(data.payload);
                            break;
                        case 'delete':
                            this.handleDeleteMessage(data.payload);
                            break;
                        case 'connect':
                            this.handleConncetion(data.payload);
                            break;
                        default:
                            console.warn('Unknown message type:', data.type);
                            break;
                    }

                    this.channel.ack(message);
                }
            });
                } catch (error) {
                        console.error('Failed to consume messages from queue:', error);
                    }
    }


    async assertQueue(exchangeName: string, durable: any): Promise<void> {
        await this.channel.assertQueue(exchangeName,  durable)
    }


    async sendToQueue(exchangeName: string,  data: any): Promise<void> {
          this.channel.sendToQueue(exchangeName,  data)
            await this.consumeMessages(exchangeName, data)
    }



handleInsertMessage(payload: any): void {
        const { id, name, properties } = payload;
        // Create node in Neo4j
        const serializedProperties = JSON.stringify(properties);

         try {
             const neo4jQuery = 'CREATE (n:Node { id: $id, name: $name, properties: $properties })';
             this.session.run(neo4jQuery, { id, name, properties: serializedProperties }).then((result) => {
                 // Handle the query result
             }).catch(error=> console.log(error));

         } catch(error) {
             console.log('neo4j error',error)
         }

    }

    async handleUpdateMessage(payload: any) {
        const { id, name, properties } = payload;
        const serializedProperties = JSON.stringify(properties);
        try {
            const neo4jQuery  = 'MATCH (n:Node) WHERE n.id = $id SET n.name = $name, n.properties = $properties';
            await this.session.run(neo4jQuery, { id, name, properties: serializedProperties }).catch(error=> console.log(error))
        } catch(error) {
            console.log('neo4j error',error)
        }

    }

     handleDeleteMessage(payload: any): void {
        const neo4jQuery = 'MATCH (n:Node)\n' +
            'WHERE n.id = $id\n' +
            'OPTIONAL MATCH (n)-[r]-()\n' +
            'WITH n, collect(r) AS relationships\n' +
            'FOREACH (rel IN relationships | DELETE rel)\n' +
            'DELETE n';
        this.session.run(neo4jQuery, { id: payload?.id }).catch(error=> console.log(error));
    }

    async handleConncetion(payload: any)  {
        // Add relationship in Neo4j
        const {sourceNodeId, relationshipType, targetNodeId} = payload;
        const neo4jQuery = `MERGE (p1:Node {id: $sourceNodeId}) MERGE (p2:Node {id: $targetNodeId}) CREATE (p1)-[:${relationshipType}]->(p2)`;
        await this.session.run(neo4jQuery, { sourceNodeId, relationshipType, targetNodeId }).catch(error=> console.log(error));
    }


     async  startMessageQueue(neo4jDriver: Driver): Promise<void> {
        this.session = neo4jDriver.session();
        process.on('SIGINT', async () => {
            await this.channel.close();
            await this.connection.close();
            process.exit(0);
        });
    }

}

