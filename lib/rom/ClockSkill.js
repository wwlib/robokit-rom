"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Skill_1 = require("./Skill");
class ClockSkill extends Skill_1.default {
    constructor(robot) {
        super(robot, 'clockSkill', 'launchClock');
        // console.log(`ClockSkill: constructor: ${robot.serialName}`);
    }
    launch(data) {
        if (this.robot) {
            // console.log(`ClockSkill: launch: ${this.robot.serialName}`);
            let time = new Date();
            let hours = time.getHours(); //'9';
            if (hours > 12) {
                hours -= 12;
            }
            let minutes = time.getMinutes(); //'35'
            let minutesPrefix = (minutes < 10) ? 'oh' : '';
            let timePrompt = `<anim name='emoji-clock-hf-01' nonBlocking='true'/>The time is ${hours} ${minutesPrefix} ${minutes}`;
            if (this.robot.requester) {
                let p = this.robot.requester.expression.say(timePrompt).complete;
                p.then(() => {
                    // console.log(`Robot: sendCommand: done`);
                })
                    .catch((result) => {
                    if (this.robot) {
                        this.robot.updateRobotStatusMessages(JSON.stringify(result, null, 2));
                    }
                });
            }
        }
        else {
            // console.log(`ClockSkill: launch: error: robot is undefined`);
        }
    }
    tick(frameTime, elapsedTime) {
    }
}
exports.default = ClockSkill;
//# sourceMappingURL=ClockSkill.js.map