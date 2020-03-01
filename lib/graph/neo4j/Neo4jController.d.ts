export declare type GraphConnection = {
    type?: string;
    url: string;
    user: string;
    password: string;
    initialCypher?: string;
};
export default class Neo4jController {
    driver: any;
    constructor(connection: GraphConnection);
    call(cypher: string, params?: any): Promise<any>;
    getCypherAsD3(cypher: string, params?: any): Promise<any>;
    getNodesAndRelationships(limit?: number): Promise<any>;
    getNodesWithPropertyAndValue(property: string, value: string): Promise<any>;
    test(): void;
}
