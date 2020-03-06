"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Skill {
    constructor(robot, id, launchIntent) {
        this.launchIntent = '';
        this.running = false;
        this.robot = robot;
        this.id = id;
        this.launchIntent = launchIntent;
    }
    status() {
        let robotName = '';
        if (this.robot) {
            robotName = this.robot.name;
        }
        return {
            type: 'skill',
            robotName: robotName,
            id: this.id,
            launchIntent: this.launch,
            running: this.running,
        };
    }
}
exports.default = Skill;
//# sourceMappingURL=Skill.js.map