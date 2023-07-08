import { Node } from '../models/node';
import { NodeRepository } from '../repositories/nodeRepository';

export class NodeService {
    constructor(private readonly nodeRepository: NodeRepository) {}

    async addNode(name: string, properties: Record<string, any>): Promise<Node> {
        const node = new Node('', name, properties);
        return this.nodeRepository.addNode(node);
    }

    async updateNode(nodeId: string, name: string, properties: Record<string, any>): Promise<Node> {
        const node = new Node(nodeId, name, properties);
        return this.nodeRepository.updateNode(node);
    }

    async deleteNode(nodeId: string): Promise<void> {
        await this.nodeRepository.deleteNode(nodeId);
    }

    async connectNodes(sourceNodeId: string, targetNodeId: string): Promise<void> {
        // Implement the logic to connect two nodes
    }
}