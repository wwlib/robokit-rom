"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BoltToD3_1 = require("./BoltToD3");
// const klbolt = require('./klbolt.js');
class PartnersGraphHelper {
    static data(cypherResponse, neo4j) {
        let result = {};
        let parser = new BoltToD3_1.default(neo4j);
        result = parser.parse(cypherResponse);
        return result;
    }
}
exports.default = PartnersGraphHelper;
//# sourceMappingURL=D3Helper.js.map