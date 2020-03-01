export default class BoltToD3 {
    neo4j: any;
    nodes: Map<number, any>;
    relationships: Map<number, any>;
    constructor(neo4j: any);
    isLink(field: any): any;
    isNode(field: any): boolean;
    parse(boltResponse: any): {
        nodes: any[];
        links: any[];
    };
    makeNode(field: any): number;
    makeLink(field: any, id1: number, id2: number): void;
    convertNumberProps(props: any): any;
    convertInt(neoInt: any): any;
    getId(field: any): number;
    parseFields(fields: any[]): void;
}
