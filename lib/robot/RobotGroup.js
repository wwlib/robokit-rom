"use strict";
// import { Robot } from './Robot';
Object.defineProperty(exports, "__esModule", { value: true });
class RobotGroup {
    constructor(name) {
        this.name = name || '';
        this.robotList = [];
    }
    // { "name": "Team A", "robots": ["salt", "maize"]}
    initWithData(data) {
        if (data && data.name && data.robots) {
            this.name = data.name;
            let robotNames = data.robots;
            robotNames.forEach((robotName) => {
                this.robotList.push(robotName);
            });
        }
    }
    get json() {
        let json = {
            name: this.name,
            robots: this.robotList,
        };
        return json;
    }
    get robotNames() {
        return this.robotList;
    }
    addRobotName(name) {
        this.robotList.push(name);
    }
    removeRobotName(robotNameToRemove) {
        let tempRobotList = [];
        this.robotList.forEach((robotName) => {
            if (robotName != robotNameToRemove) {
                tempRobotList.push(robotName);
            }
        });
    }
}
exports.default = RobotGroup;
//# sourceMappingURL=RobotGroup.js.map