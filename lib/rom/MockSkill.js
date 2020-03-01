"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Skill_1 = require("./Skill");
class MockSkill extends Skill_1.default {
    constructor(robot) {
        super(robot, 'mockSkill', 'mockIntent');
    }
    launch(data) {
    }
    tick(frameTime, elapsedTime) {
    }
}
exports.default = MockSkill;
//# sourceMappingURL=MockSkill.js.map