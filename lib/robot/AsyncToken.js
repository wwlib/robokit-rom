"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class AsyncToken extends events_1.EventEmitter {
    constructor() {
        super();
        this.complete = undefined;
        this.update = {
            on: (callback) => {
                this.on('update', callback);
            }
        };
    }
}
exports.default = AsyncToken;
//# sourceMappingURL=AsyncToken.js.map