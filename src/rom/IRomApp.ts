// TBD
// Interface
// Global Rom App info interface

export default interface IRomApp {
    port: number;
    nluDefault: string;
    clientId: string;
    clientSecret: string;
    neo4j_url: string;
    neo4j_user: string;
    neo4j_password: string;
}