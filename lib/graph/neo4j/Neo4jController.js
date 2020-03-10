"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const neo4j = require('neo4j-driver').v1;
const D3Helper_1 = require("./helpers/D3Helper");
class Neo4jController {
    constructor(connection) {
        try {
            this.driver = neo4j.driver(connection.url, neo4j.auth.basic(connection.user, connection.password));
        }
        catch (err) {
            // console.log(`Neo4jController: constructor: `, err);
            this.driver = undefined;
        }
    }
    call(cypher, params) {
        return new Promise((resolve, reject) => {
            let session = this.driver.session();
            session.run(cypher, params)
                .then(function (result) {
                session.close();
                resolve(result);
            })
                .catch(function (error) {
                reject(error);
            });
        });
    }
    getCypherAsD3(cypher, params) {
        return new Promise((resolve, reject) => {
            this.call(cypher, params)
                .then(response => {
                resolve(D3Helper_1.default.data(response, neo4j));
            })
                .catch(error => {
                reject(error);
            });
        });
    }
    getNodesAndRelationships(limit = 25) {
        return new Promise((resolve, reject) => {
            let cypher = `
                MATCH (n)-[r]-(p), (q) return n,r,p, q limit ${limit}
            `;
            this.call(cypher)
                .then(response => {
                resolve(D3Helper_1.default.data(response, neo4j));
            })
                .catch(error => {
                reject(error);
            });
        });
    }
    getNodesWithPropertyAndValue(property, value) {
        return new Promise((resolve, reject) => {
            let cypher = `
                MATCH (n {${property}: "${value}"})-[r]-(p)
                return n,r,p
            `;
            this.call(cypher)
                .then(response => {
                resolve(D3Helper_1.default.data(response, neo4j));
            })
                .catch(error => {
                reject(error);
            });
        });
    }
    test() {
        this.call('MATCH (n) return n LIMIT 10')
            .then(result => {
            // console.log(result);
        })
            .catch(error => {
            // console.log(error);
        });
    }
}
exports.default = Neo4jController;
//# sourceMappingURL=Neo4jController.js.map