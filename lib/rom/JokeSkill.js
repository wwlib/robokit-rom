"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Skill_1 = require("./Skill");
const PersistenceManager_1 = require("./PersistenceManager");
class JokeSkill extends Skill_1.default {
    constructor(robot) {
        super(robot, 'JokeSkill', 'launchJoke');
        this.jokeMap = new Map();
        this.jokeIterator = this.jokeMap.values();
        // console.log(`JokeSkill: constructor: ${robot.serialName}`);
        this.initJokes();
    }
    initJokes() {
        let jokeData = [
            { id: "001", name: "sleevies", prompt: "Where does the General keep his armies? <anim name='Thinking_01' /> In his sleevies!" },
            { id: "002", name: "chicken", prompt: "Why did the chicken cross the road? <anim name='Thinking_01' /> To get to the other side." },
            { id: "003", name: "elephant", prompt: "You know why you never see elephants hiding up in trees? <anim name='Thinking_01' /> Because they’re really good at it." },
            { id: "004", name: "paint", prompt: "What is red and smells like blue paint? <anim name='Thinking_01' /> Red paint." }
        ];
        jokeData.forEach((joke) => {
            this.jokeMap.set(joke.id, joke);
        });
        this.jokeIterator = this.jokeMap.values();
    }
    launch(data) {
        if (this.robot) {
            // console.log(`JokeSkill: launch: ${this.robot.serialName}`);
            let joke = this.jokeIterator.next().value;
            if (!joke) {
                this.jokeIterator = this.jokeMap.values();
                joke = this.jokeIterator.next().value;
            }
            let jokePrompt = joke.prompt;
            if (this.robot.requester) {
                // let p = this.robot.requester.play.say(jokePrompt).complete;
                let p = this.robot.requester.expression.say(jokePrompt).complete;
                p.then(() => {
                    // console.log(`JokeSkill: launch: done`);
                    this.running = false;
                    if (this.robot) {
                        let launchId = 'na';
                        if (data && data.launchId) {
                            launchId = data.launchId;
                        }
                        PersistenceManager_1.default.Instance.persistJoke(this.robot, joke, launchId);
                    }
                })
                    .catch((result) => {
                    if (this.robot) {
                        this.robot.updateRobotStatusMessages(JSON.stringify(result, null, 2));
                    }
                });
            }
        }
        else {
            // console.log(`JokeSkill: launch: error: robot is undefined`);
        }
    }
    tick(frameTime, elapsedTime) {
    }
}
exports.default = JokeSkill;
//# sourceMappingURL=JokeSkill.js.map