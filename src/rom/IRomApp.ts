// TBD
// Interface
// Global Rom App info interface

export default interface IRomApp {
    port: number;
    nluDefault: string;
    clientId: string;
    clientSecret: string;
    neo4jUrl?: string;
    neo4jUser?: string;
    neo4jPassword?: string;
}