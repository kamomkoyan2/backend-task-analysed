#  Node.js Application with CRUD Operations and Data Synchronization

This project contains a Node.js application written in TypeScript that enables CRUD (Create, Read, Update, Delete) operations on nodes. The application includes a Dockerfile for easy setup, and RabbitMQ is utilized as the message broker for data synchronization between Postgres and Neo4j databases.


## Getting Started

To run the application and perform CRUD operations, follow these steps:

### 1 : Clone the repository:


## Before Start the application using Docker Compose:
> ⚠️ **Warning:** 
>Make sure that you are not running on your local machine this services.
 

- RabbitMQ 
- Postgres 
- Neo4j 

### 1 : docker-compose up --build:


5. CRUD Operations:

- **Create a new node:**
    - Make a POST request to `http://localhost:3000/node` with the required parameters in the request payload.
    - This operation creates a new node in both the Node.js application and the Neo4j database.
    - RabbitMQ handles data synchronization with Postgres.
     ```json
  {
       "name": "Node Name",
       "properties": {*****}
  }
  ```

- **Update a node:**
    - Make a PUT request to `http://localhost:3000/node/:Id` (replace `:Id` with the node identifier) with the updated data in the request payload.
    - This operation updates the specified node in the Node.js application.

- **Delete a node:**
    - Make a DELETE request to `http://localhost:3000/node/delete/:id` (replace `:id` with the node identifier).
    - This operation deletes the specified node from both the Node.js application and the Neo4j database.
    - If connected nodes exist, the connections will also be deleted.

- **Connect two nodes (Neo4j only):**
    - Make a POST request to `http://localhost:3000/node/connect` with the required parameters for connecting two nodes in the request payload.
    - This operation creates a connection between two nodes in the Neo4j database.
        
- **Get all nodes from Postgres:**
    - Make a GET request to `http://localhost:3000/node`.
    - This operation retrieves all nodes stored in the Postgres database.

- **Get all nodes from Neo4j:**
    - Make a GET request to `http://localhost:3000/node/graphs`.
    - This operation retrieves all nodes stored in the Neo4j database.

## RabbitMQ Message Broker

RabbitMQ is used as the message broker for data synchronization between Postgres and Neo4j databases. It ensures consistent data updates across both systems.

## Frontend Hosting Note *

> ⚠️ **Warning:**
> Please note that the frontend interface is not hosted because the Node.js application runs locally. To interact with the locally hosted Node.js application, it is recommended to run the frontend locally as well.
