"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AsyncToken_1 = require("./AsyncToken");
class AsyncTokenHotword extends AsyncToken_1.default {
    constructor() {
        super();
        this.hotWordHeard = {
            on: (callback) => {
                this.on('hotWordHeard', callback);
            }
        };
    }
}
exports.default = AsyncTokenHotword;
//# sourceMappingURL=AsyncTokenHotword.js.map