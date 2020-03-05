"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// { "name": "Anim: Celebrate_01", "type": "animation", "data": { "file": "Celebrate_01.keys"} }
class RomCommand {
    constructor(name, type, data, keyCode) {
        this.name = '';
        this.type = '';
        this.keyCode = '';
        this.initWithData({
            name: name || '',
            type: type || '',
            data: data,
            keyCode: keyCode || ''
        });
    }
    initWithData(data) {
        this.name = data.name;
        this.type = data.type;
        this.data = data.data;
        this.keyCode = data.keyCode || '';
    }
    get json() {
        let json = {
            name: this.name,
            type: this.type,
            data: this.data,
            keyCode: this.keyCode,
        };
        return json;
    }
}
exports.default = RomCommand;
//# sourceMappingURL=RomCommand.js.map