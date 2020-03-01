"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// { "name": "Anim: Celebrate_01", "type": "animation", "data": { "file": "Celebrate_01.keys"} }
class RomCommand {
    constructor(name, type, data) {
        this.name = '';
        this.type = '';
        this.initWithData({
            name: name || '',
            type: type || '',
            data: data
        });
    }
    initWithData(data) {
        this.name = data.name;
        this.type = data.type;
        this.data = data.data;
    }
    get json() {
        let json = {
            name: this.name,
            type: this.type,
            data: this.data
        };
        return json;
    }
}
exports.default = RomCommand;
//# sourceMappingURL=RomCommand.js.map