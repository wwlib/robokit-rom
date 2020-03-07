"use strict";
// import { Robot } from './Robot';
Object.defineProperty(exports, "__esModule", { value: true });
class RobotGroup {
    constructor(name) {
        this._name = name || '';
        this._robotNames = [];
    }
    // { "name": "Team A", "robots": ["salt", "maize"]}
    initWithData(data) {
        if (data && data.name && data.robots) {
            this._name = data.name;
            let robotNames = data.robots;
            robotNames.forEach((robotName) => {
                this._robotNames.push(robotName);
            });
        }
    }
    get name() {
        return this._name;
    }
    get json() {
        let json = {
            name: this.name,
            robots: this._robotNames,
        };
        return json;
    }
    get robotNames() {
        return this._robotNames;
    }
    addRobotName(name) {
        this._robotNames.push(name);
    }
    removeRobotName(robotNameToRemove) {
        let tempRobotList = [];
        this._robotNames.forEach((robotName) => {
            if (robotName != robotNameToRemove) {
                tempRobotList.push(robotName);
            }
        });
    }
}
exports.default = RobotGroup;
//# sourceMappingURL=RobotGroup.js.map