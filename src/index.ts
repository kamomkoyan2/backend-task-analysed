import express, {Express, NextFunction, Request, Response} from 'express';

import { scopePerRequest } from 'awilix-express';
import dotenv from 'dotenv';
import bodyParser from "body-parser";
import container from "./shared/DI.setup";
import cors from 'cors'

const router = container.resolve('router')
const route = router.getRouter()


dotenv.config()


const app: Express = express()
const port = process.env.PORT;

// const whitelist = ['http://127.0.0.1:5173', 'http://example2.com']
// const corsOptions:any =   {
//     origin: function (origin: any, callback: any) {
//         if (whitelist.indexOf(origin) !== -1) {
//             callback(null, true)
//         } else {
//             callback(new Error('Not allowed by CORS'))
//         }
//     }
// }

app.use(cors())



app.use(bodyParser.json())

// Register dependencies

// Resolve the dependencies
const postgresDatabase = container.resolve('postgresDatabase')

app.use('/nodes', route);
app.use(scopePerRequest(container));


// Configure express app and middleware
app.use(express.json());


app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({ message: 'Internal Server Error' });
});


const queue = container.resolve('messageQueue')
const neo4j = container.resolve('neo4jDatabase')
app.get('/', (req: Request, res: Response) => {
    res.send('Express + TypeScript Server');
});


app.listen(port, () => {
    postgresDatabase.connect()
    queue.startMessageQueue(neo4j.driver);
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});