import { Router } from 'express';
import container from "../shared/DI.setup";

export class NodeRouter {
    private readonly router: Router;

    constructor() {
        this.router = Router();
        this.configureRoutes();
    }

    public getRouter(): Router {
        return this.router;
    }

    private configureRoutes(): void {
        const controller = container.resolve('controller')
        this.router.post('/', controller.addNode.bind(this));
        this.router.put('/:id', controller.updateNode.bind(this))
        this.router.delete('/delete/:id', controller.deleteNode.bind(this))
        this.router.post('/connect', controller.connectNodes.bind(this))
        this.router.get('/', controller.getNodes.bind(this))
        this.router.get('/graphs', controller.getGraphNodes.bind(this))
        this.router.get('/:id', controller.getNode.bind(this))
    }
}