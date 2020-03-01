"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Skill_1 = require("./Skill");
const PersistenceManager_1 = require("./PersistenceManager");
class DoYouLikeSkill extends Skill_1.default {
    constructor(robot) {
        super(robot, 'DoYouLikeSkill', 'launchUserLikes');
        console.log(`DoYouLikeSkill: constructor: ${robot.serialName}`);
    }
    launch(data) {
        if (this.robot) {
            console.log(`DoYouLikeSkill: launch: ${this.robot.serialName}`, data);
            let launchId = 'na';
            let user = undefined;
            let thing = undefined;
            let thingOriginal = undefined;
            if (data && data.launchId) {
                launchId = data.launchId;
            }
            let nluData;
            if (data && data.nluData) {
                nluData = data.nluData;
            }
            if (nluData && nluData.parameters && nluData.parameters.user) {
                user = nluData.parameters.user;
            }
            if (data && nluData.parameters && nluData.parameters.thing) {
                thing = nluData.parameters.thing;
            }
            if (nluData && nluData.parameters && nluData.parameters.thingOriginal) {
                thingOriginal = nluData.parameters.thingOriginal;
            }
            console.log(nluData, user, thingOriginal);
            if (user && thingOriginal) {
                let prompt = `OK. Thank you for telling me that ${user} likes ${thingOriginal}}. I will try and remember that.`;
                if (this.robot.requester) {
                    let p = this.robot.requester.expression.say(prompt).complete;
                    p.then(() => {
                        // console.log(`DoYouLikeSkill: launch: done`);
                        this.running = false;
                        if (this.robot && thing && launchId && user) {
                            PersistenceManager_1.default.Instance.persistUserLikesThing(this.robot, thing, launchId, user);
                        }
                        else {
                            console.log(`DoYouLikeSkill: not enough info to call PersistenceManager`);
                        }
                    })
                        .catch((result) => {
                        if (this.robot) {
                            this.robot.updateRobotStatusMessages(JSON.stringify(result, null, 2));
                        }
                    });
                }
            }
        }
        else {
            console.log(`DoYouLikeSkill: launch: error: robot is undefined`);
        }
    }
    tick(frameTime, elapsedTime) {
    }
}
exports.default = DoYouLikeSkill;
//# sourceMappingURL=DoYouLikeSkill.js.map