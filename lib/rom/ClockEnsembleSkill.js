"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EnsembleSkill_1 = require("./EnsembleSkill");
class ClockEnsembleSkill extends EnsembleSkill_1.default {
    constructor(id, launchIntent) {
        super(id, launchIntent);
    }
    launch(data) {
        // console.log(`ClockEnsembleSkill: launch: running: ${this.running}`);
        if (!this.running) {
            this.running = true;
            let hubArray = this.getShuffledArrayOfHubs();
            if (hubArray && hubArray.length > 0) {
                let time = new Date();
                let hours = time.getHours(); //'9';
                if (hours > 12) {
                    hours -= 12;
                }
                let minutes = time.getMinutes(); //'35'
                let minutesPrefix = (minutes < 10) ? 'oh' : '';
                let timePrompt = `<anim name='emoji-clock-hf-01' nonBlocking='true'/>The current time is ${hours} ${minutesPrefix} ${minutes}`;
                let primaryHub = hubArray.shift();
                if (primaryHub && primaryHub.robot) {
                    let robot = primaryHub.robot;
                    if (robot.requester) {
                        let p = robot.requester.expression.say(timePrompt).complete;
                        p.then(() => {
                            // console.log(`ClockEnsembleSkill: launch: done`);
                            this.running = false;
                        })
                            .catch((result) => {
                            robot.updateRobotStatusMessages(JSON.stringify(result, null, 2));
                        });
                    }
                }
                hubArray.forEach((hub) => {
                    if (hub && hub.robot) {
                        let robot = hub.robot;
                        if (robot.requester) {
                            let prompt = `<break size='3.0'/><anim cat='shift' layers='body' nonBlocking='true'/><anim cat='happy' layers='screen' filter='&(eye-only)' nonBlocking='true' />.Yeah, that's right.`;
                            // let p = robot.requester.play.say(`<break size='3.0'/><anim cat='shift' layers='body' nonBlocking='true'/><anim cat='happy' layers='screen' filter='&(eye-only)' nonBlocking='true' />.Yeah, that's right.`).complete;
                            let p = robot.requester.expression.say(prompt).complete;
                            p.then(() => {
                                // console.log(`ClockEnsembleSkill: launch: done`);
                            })
                                .catch((result) => {
                                robot.updateRobotStatusMessages(JSON.stringify(result, null, 2));
                            });
                        }
                    }
                });
            }
        }
    }
    tick(frameTime, elapsedTime) {
    }
}
exports.default = ClockEnsembleSkill;
//# sourceMappingURL=ClockEnsembleSkill.js.map