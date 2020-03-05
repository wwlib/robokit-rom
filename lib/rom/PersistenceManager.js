"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Neo4jController_1 = require("../graph/neo4j/Neo4jController");
// import { d3Types }  from '../neo4j/DataTypes';
const ActivityParser_1 = require("./ActivityParser");
// const neo4jConfig: any = require ('../../../data/neo4j-config.json');
class PersistenceManager {
    constructor() {
        // this.neo4jController.getNodesAndRelationships()
        //     .then((d3Data: d3Types.d3Graph) => {
        //         console.log(`PersistenceManager: d3Data: `, d3Data);
        //     })
        //     .catch((err: any) => {
        //         console.log(`PersistenceManager: construcor: err: `, err);
        //     })
        // this.getActivity('brown');
    }
    static get Instance() {
        // Do you need arguments? Make it a regular method instead.
        return this._instance || (this._instance = new this());
    }
    connect(romApp, force = false) {
        console.log(`PersistenceManager: connect: `, romApp);
        this.romApp = romApp;
        if (this.romApp && this.romApp.neo4jUrl && this.romApp.neo4jUser && this.romApp.neo4jPassword && (!this.neo4jController || force)) {
            this.graphConnection = {
                type: 'neo4j',
                url: this.romApp.neo4jUrl,
                user: this.romApp.neo4jUser,
                password: this.romApp.neo4jPassword
            };
            console.log(`PersistenceManager: connect: instantiating Neo4jController:`, this.graphConnection);
            this.neo4jController = new Neo4jController_1.default(this.graphConnection);
        }
    }
    persistLaunchIntent(robotId, userId, intent, launchId) {
        let timestamp = new Date().toLocaleString();
        let cypher = `MERGE (i:Intent {name: "${intent}"})
WITH i MERGE (n:Robot {name: "${robotId}"})
WITH i, n MERGE (n)-[r:LAUNCHED {robot: "${robotId}", user: "${userId}", time: "${timestamp}", launchId: "${launchId}"}]->(i) return n, i, r
`;
        let params = {};
        if (this.neo4jController) {
            this.neo4jController.call(cypher, params)
                .then((result) => {
                console.log(`PersistenceManager: persistLaunchIntent: `, result, cypher);
            })
                .catch((err) => {
                console.log(`PersistenceManager: persistLaunchIntent: err: `, err, cypher);
            });
        }
    }
    getActivity(robotId) {
        return new Promise((resolve, reject) => {
            let cypher = `MATCH (n:Robot {name: "${robotId}"})-[r:LAUNCHED]->(i:Intent) return n,r,i`;
            let params = {};
            if (this.neo4jController) {
                this.neo4jController.getCypherAsD3(cypher, params)
                    .then((result) => {
                    console.log(`PersistenceManager: getActivity: `, result);
                    let activityParser = new ActivityParser_1.default(result);
                    console.log(activityParser.events);
                })
                    .catch((err) => {
                    console.log(`PersistenceManager: getActivity: err: `); //, err);
                });
            }
        });
    }
    persistJoke(robot, joke, launchId) {
        let cypher = `MERGE (j:Joke {id: "${joke.id}", name: "${joke.name}"})
WITH j MERGE (n:Robot {name: "${robot.name}"})
WITH j, n MERGE (n)-[r:TOLD {robot: "${robot.name}", launchId: "${launchId}"}]->(j) return n, j, r
`;
        let params = {};
        if (this.neo4jController) {
            this.neo4jController.call(cypher, params)
                .then((result) => {
                console.log(`PersistenceManager: persistJoke: `, result, cypher);
            })
                .catch((err) => {
                console.log(`PersistenceManager: persistJoke: err: `, err, cypher);
            });
        }
    }
    persistUserLikesThing(robot, thing, launchId, userId) {
        let cypher = `MERGE (e:Entity {name: "${thing}"})
WITH e MERGE (user:User {name: "${userId}"})
WITH e, user MERGE (user)-[r:LIKES {robot: "${robot.name}", launchId: "${launchId}"}]->(e) return user, e, r
`;
        let params = {};
        if (this.neo4jController) {
            this.neo4jController.call(cypher, params)
                .then((result) => {
                console.log(`PersistenceManager: persistUserLikesThing: `, result, cypher);
            })
                .catch((err) => {
                console.log(`PersistenceManager: persistUserLikesThing: err: `, err, cypher);
            });
        }
    }
}
exports.default = PersistenceManager;
//# sourceMappingURL=PersistenceManager.js.map