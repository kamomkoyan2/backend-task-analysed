import {createContainer, asClass, Lifetime, AwilixContainer} from "awilix";
import PostgresDatabase from "../infrastructure/db/postgres";
import Neo4jDatabase from "../infrastructure/db/neo4j";
import MessageQueue from "../infrastructure/messageQueue/rabbitmq";
import {NodeRouter} from "../routes";
import {NodesController} from "../controllers/nodeController";


const container:AwilixContainer<any> = createContainer();



container.register({
    postgresDatabase: asClass(PostgresDatabase).singleton(),
    neo4jDatabase: asClass(Neo4jDatabase).singleton(),
    messageQueue: asClass(MessageQueue).singleton(),
    router: asClass(NodeRouter).singleton(),
    controller: asClass(NodesController).singleton()
})


export default container