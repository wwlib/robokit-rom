"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RobotGroup_1 = require("./RobotGroup");
class RobotGroups {
    constructor() {
        this.robotGroupsList = [];
        this.robotGroupsMap = new Map();
    }
    initWithData(dataList) {
        dataList.forEach((data) => {
            let robotGroup = new RobotGroup_1.default();
            robotGroup.initWithData(data);
            this.robotGroupsList.push(robotGroup);
            this.robotGroupsMap.set(robotGroup.name, robotGroup);
        });
    }
    get json() {
        let json = [];
        this.robotGroupsList.forEach(robotGroup => {
            json.push(robotGroup.json);
        });
        return json;
    }
    get robotGroupNames() {
        let names = [];
        this.robotGroupsList.forEach(robotGroup => {
            names.push(robotGroup.name);
        });
        return names;
    }
    getRobotGroupWithName(name) {
        return this.robotGroupsMap.get(name);
    }
    addRobotGroup(robotGroup) {
        this.robotGroupsList.push(robotGroup);
        this.robotGroupsMap.set(robotGroup.name, robotGroup);
    }
    removeRobotGroup(robotGroupToRemove) {
        let tempRobotGroupsList = [];
        let tempRobotGroupsMap = new Map();
        this.robotGroupsList.forEach(robotGroup => {
            if (robotGroup != robotGroupToRemove) {
                tempRobotGroupsList.push(robotGroup);
                tempRobotGroupsMap.set(robotGroup.name, robotGroup);
            }
        });
    }
}
exports.default = RobotGroups;
//# sourceMappingURL=RobotGroups.js.map