import { Node } from '../models/node';

export interface NodeRepository {
    addNode(node: Node): Promise<Node>;
    updateNode(node: Node): Promise<Node>;
    deleteNode(nodeId: string): Promise<void>;
}