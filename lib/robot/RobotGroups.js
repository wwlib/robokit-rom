"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RobotGroup_1 = require("./RobotGroup");
class RobotGroups {
    constructor() {
        this.robotGroupsMap = new Map();
    }
    initWithData(dataList) {
        if (dataList) {
            dataList.forEach((data) => {
                let robotGroup = new RobotGroup_1.default();
                robotGroup.initWithData(data);
                this.addRobotGroup(robotGroup);
            });
        }
    }
    get json() {
        let json = [];
        let groups = Array.from(this.robotGroupsMap.values());
        groups.forEach(robotGroup => {
            json.push(robotGroup.json);
        });
        return json;
    }
    get robotGroupNames() {
        let names = Array.from(this.robotGroupsMap.keys());
        names.sort();
        return names;
    }
    getRobotGroupWithName(name) {
        return this.robotGroupsMap.get(name);
    }
    addRobotGroup(robotGroup) {
        this.robotGroupsMap.set(robotGroup.name, robotGroup);
    }
    removeRobotGroup(robotGroupToRemove) {
        this.robotGroupsMap.delete(robotGroupToRemove.name);
    }
}
exports.default = RobotGroups;
//# sourceMappingURL=RobotGroups.js.map