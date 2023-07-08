import neo4j, { Driver, Session } from 'neo4j-driver';


export default class Neo4jDatabase{
    private readonly driver: Driver;
    private session: Session;
    constructor() {
        this.driver = neo4j.driver(
            'neo4j://task-analysed-neo4j-1'
        )
    }

    async run(query: string):Promise<any>{
        try {
            this.session  = this.driver.session()
            const result = this.session.run(query)
            return result;
        } catch (error) {
            console.error('Failed to execute query:', error);
            throw error;
        }
    }

}