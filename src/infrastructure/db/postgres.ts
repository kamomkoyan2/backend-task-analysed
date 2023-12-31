import { QueryResult, Pool, Client} from "pg";

export default class PostgresDatabase {
    private readonly pool: Pool;

    constructor() {
        this.pool = new Pool({
            user: 'postgres',        // PostgreSQL username
            password: 'postgres',    // PostgreSQL password
            host: 'backend-task-analysed-postgres-1',       // PostgreSQL host
            port: 5432,              // PostgreSQL port
            database: 'postgres' // PostgreSQL database name
        })

    }


    async  createNodesTable(): Promise<void> {
        try {
            await this.pool.query(`
      CREATE TABLE IF NOT EXISTS nodes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        properties JSONB
      )
    `);
            console.log('Nodes table created successfully');
        } catch (error) {
            console.error('Failed to create Nodes table:', error);
        } finally {
        }
    }






    async query(sql: string, params?: any[]): Promise<QueryResult<any>> {
        try {
            const result = this.pool.query(sql, params);
            return result;
        } catch (error) {
            console.error('Failed to execute query:', error);
            throw error;
        }
    }


    async  connect(): Promise<void> {
        try {
            await this.pool.connect();
            await this.createNodesTable();
            console.log('Connected to PostgreSQL database');
        } catch (error) {
            console.error('Failed to connect to PostgreSQL database:', error);
        }
    }

}