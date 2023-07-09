import { Router, Request, Response } from 'express';
import { Node } from '../interfaces/node';
import container from "../shared/DI.setup";
import {MessagePayload} from "../interfaces/message";

export class NodesController {

    private readonly pool: any;
    private channel: any;

    constructor() {
        this.pool = container.resolve('postgresDatabase');
        this.channel = container.resolve('messageQueue');
    }


    public async addNode(req: Request, res: Response): Promise<void> {
        const pool = container.resolve('postgresDatabase')
        const channel = container.resolve('messageQueue')
        try {
            const { name, properties } = req.body as Node;

            await pool.query("BEGIN")
            // Insert into PostgreSQL
            const pgQuery = 'INSERT INTO nodes (name, properties) VALUES ($1, $2) RETURNING *';
            const pgValues = [name, JSON.stringify(properties)];
            const pgResult = await pool.query(pgQuery, pgValues);
            // Publish message to RabbitMQ
            const message: MessagePayload = {
                type: 'insert',
                payload: pgResult.rows[0],
            };


            await channel.assertQueue('postgre-neo4j-sync',  {
                durable: true,
            });
            await channel.sendToQueue('postgre-neo4j-sync', Buffer.from(JSON.stringify(message)));
            await pool.query('COMMIT'); // Commit the transaction
            res.status(201).json({message: 'successfully created node'});
        } catch (error) {
            await pool.query('ROLLBACK');
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }

    }



    private async updateNode(req: Request, res: Response): Promise<void> {
        const pool = container.resolve('postgresDatabase')
        const channel = container.resolve('messageQueue')
        try {
            const nodeId = req.params.id;
            const { name, properties } = req.body as Node;
            const pgQuery = 'UPDATE nodes SET name = $1, properties = $2 WHERE id = $3 RETURNING *';
            const pgValues = [name, JSON.stringify(properties), nodeId];
            const pgResult = await pool.query(pgQuery, pgValues);
            const message: MessagePayload = {
                type: 'update',
                payload: pgResult.rows[0],
            };
            await channel.sendToQueue('postgre-neo4j-sync', Buffer.from(JSON.stringify(message)));

            res.status(200).json({message: 'successfully updated node'});
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error });
        }
    }


    private async deleteNode(req: Request, res: Response): Promise<void> {
        const pool = container.resolve('postgresDatabase')
        const channel = container.resolve('messageQueue')


        try {
            const nodeId = req.params.id;

            // Delete from PostgreSQL
            const pgQuery = 'DELETE FROM nodes WHERE id = $1 RETURNING *';
            const pgValues = [nodeId];
            const pgResult = await pool.query(pgQuery, pgValues);

            const message: MessagePayload = {
                type: 'delete',
                payload: pgResult.rows[0],
            };
            await channel.sendToQueue('postgre-neo4j-sync', Buffer.from(JSON.stringify(message)));

            res.status(200).json({message: 'successfully was deleted node'});
        } catch (error) {
            res.status(500).json({ message: error });
        }
    }

    private async getNode(req: Request, res: Response): Promise<void> {
        const pool = container.resolve('postgresDatabase')


        try {
            const nodeId = req.params.id;
            // Delete from PostgreSQL
            const pgQuery = 'SELECT * FROM nodes WHERE id = $1';
            const pgValues = [nodeId];
            const pgResult = await pool.query(pgQuery, pgValues);
            // Check if a matching node was found
            if (pgResult.rows.length === 0) {
                res.status(404).json({ message: 'Node not found' });
                return;
            }
            res.json(pgResult.rows[0]);
        } catch (error) {
            res.status(500).json({ message: error });
        }
    }


    private async connectNodes(req: Request, res: Response): Promise<void> {
        const channel = container.resolve('messageQueue')
        try {
            const { sourceNodeId, targetNodeId } = req.body;

            const message: MessagePayload = {
                type: 'connect',
                payload: {sourceNodeId, targetNodeId},
            };
            await channel.sendToQueue('postgre-neo4j-sync', Buffer.from(JSON.stringify(message)));
            res.status(201).json({ message: 'Connection created' });
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }


    private async getNodes(req: Request, res: Response) : Promise<void> {
        const pool = container.resolve('postgresDatabase')

        try {
            const pgQuery = 'SELECT * FROM nodes';
            const result = await pool.query(pgQuery);

            res.json(result.rows)
        } catch(error) {
            res.status(500).json({ message: error });
        }
    }

    private async getGraphNodes(req: Request, res: Response) : Promise<void> {
        const session = container.resolve('neo4jDatabase')
        try {
            await session
                .run('MATCH (n:Node) OPTIONAL MATCH (n)-[r]->(m:Node) RETURN n, r, m')
                .then((result: any) => {
                    const nodes = result.records.map((record: any) =>({
                            node: record.get('n'),
                            relationship: record.get('r') ? record.get('r').type : null,
                            connectedNode: record.get('m') ? record.get('m').properties : null
                    }));
                    return res.json(nodes)
                })
                .catch((error: Error) => {
                    console.error('Failed to retrieve nodes from Neo4j:', error);
                });

        } catch(error) {
            res.status(500).json({ message: error });
        }
    }


}