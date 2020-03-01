"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const LUISController_1 = require("../nlu/luis/LUISController");
// import DialogflowControllerV1 from '../dialogflow/DialogflowControllerV1';
const DialogflowControllerV1_1 = require("../nlu/dialogflow/DialogflowControllerV1");
const PersistenceManager_1 = require("./PersistenceManager");
// import ClockSkill from '../rom/ClockSkill';
const JokeSkill_1 = require("./JokeSkill");
const EnsembleSkillManager_1 = require("./EnsembleSkillManager");
const UserLikesSkill_1 = require("./UserLikesSkill");
class Hub extends events_1.EventEmitter {
    constructor(robot) {
        super();
        this.dialogflowController = new DialogflowControllerV1_1.default();
        this.luisController = new LUISController_1.default();
        this.sessionId = `robot_${Math.floor(Math.random() * 10000)}`;
        this.robot = robot;
        this.skillMap = new Map();
        this.launchIntentMap = new Map();
        PersistenceManager_1.default.Instance;
        this.startTickTime = new Date().getTime();
        this.previousTickTime = this.startTickTime;
        this.tickInterval = setInterval(this.tick.bind(this), 1000);
    }
    tick() {
        this.skillMap.forEach((skill, key) => {
            if (skill && skill.running) {
                let time = new Date().getTime();
                let frameTime = time - this.previousTickTime;
                let elapsedTime = time - this.startTickTime;
                skill.tick(frameTime, elapsedTime);
            }
        });
    }
    onRobotConnected() {
        console.log(`HUB: onRobotConnected: ${this.robot.serialName}`, this.robot.requester);
        if (this.robot.requester && this.robot.requester.listen) {
            if (this.robot.romApp) {
                PersistenceManager_1.default.Instance.connect(this.robot.romApp, true);
                this.dialogflowController.config = this.robot.romApp;
                this.luisController.config = this.robot.romApp;
            }
            this.hjToken = this.robot.requester.listen.subscribe.hotword();
            this.hjToken.hotWordHeard.on((speaker) => {
                console.log("Heard Hotword from speaker: ", speaker);
                this.robot.resetKeepAlive();
                if (this.robot.requester) {
                    let listenToken = this.robot.requester.listen.start();
                    listenToken.update.on((listenResultEvent) => {
                        console.log("Hey! I think i heard something: ", listenResultEvent);
                        if (listenResultEvent) {
                            let hotWordData = { speaker: speaker, listenResultEvent: listenResultEvent };
                            this.onHotwordEvent(hotWordData);
                        }
                    });
                }
            });
        }
        this.registerSkill(new UserLikesSkill_1.default(this.robot));
        this.registerSkill(new JokeSkill_1.default(this.robot));
        let clockEnsembleSkill = EnsembleSkillManager_1.default.Instance.getEnsembleSkillWithId('clockEnsemble');
        if (clockEnsembleSkill) {
            this.registerSkill(clockEnsembleSkill);
            clockEnsembleSkill.addHub(this);
        }
    }
    registerSkill(skill) {
        console.log(`HUB: registerSkill: ${this.robot.serialName}`, skill);
        this.skillMap.set(skill.id, skill);
        this.launchIntentMap.set(skill.launchIntent, skill);
    }
    removeSkill(skill) {
        this.skillMap.set(skill.id, undefined);
        this.skillMap.delete(skill.id);
    }
    onHotwordEvent(hotwordData) {
        // get intent from asrTranscript
        console.log(`HUB: onHotwordEvent: ${this.robot.serialName}`, hotwordData);
        let userId = 'someone';
        let asr = hotwordData.listenResultEvent.Speech;
        this.getLaunchIntent(asr)
            .then((nluData) => {
            if (nluData && nluData.intent) {
                let launchIntent = nluData.intent;
                let launchId = `${new Date().getTime()}`;
                let skill = this.launchIntentMap.get(launchIntent);
                let robotIntentData = { nluType: nluData.nluType, asr: asr, intent: launchIntent, launchId: launchId, nluData: nluData, userId: userId };
                console.log(`HUB: onHotwordEvent: robotIntentData`, robotIntentData);
                if (skill) {
                    skill.launch(robotIntentData);
                    skill.running = true;
                    PersistenceManager_1.default.Instance.persistLaunchIntent(this.robot.name, userId, launchIntent, launchId);
                }
                else {
                    console.log(`HUB: onHotwordEvent: passing to robot onLaunchEvent: `, robotIntentData);
                    this.robot.onLaunchIntent(robotIntentData);
                }
            }
        })
            .catch((err) => {
            console.log(`HUB: onHotwordEvent: error: `, err);
        });
    }
    getLaunchIntent(asr) {
        let nluDefault = 'none';
        if (this.robot.romApp && this.robot.romApp.nluDefault) {
            nluDefault = this.robot.romApp.nluDefault;
        }
        return this.getIntent(asr, ['launch'], nluDefault);
    }
    getIntent(asr, contexts, nluType) {
        console.log(`HUB: getIntent: asr: ${asr}, ${nluType}, contexts: `, contexts);
        return new Promise((resolve, reject) => {
            let query = asr;
            let nluController = undefined;
            if (nluType == 'luis') {
                nluController = this.luisController;
            }
            else if (nluType == 'dialogflow') {
                nluController = this.dialogflowController;
            }
            if (nluController) {
                let context = '';
                if (contexts) {
                    context = contexts[0];
                }
                nluController.getIntentAndEntities(query, 'en-US', context, this.sessionId)
                    .then((intentAndEntities) => {
                    let nluData = {
                        nluType: nluType,
                        asr: asr,
                        intent: intentAndEntities.intent,
                        parameters: intentAndEntities.entities
                    };
                    console.log(`HUB: getIntent: nluData`, nluData);
                    resolve(nluData);
                })
                    .catch((err) => {
                    reject(err);
                });
            }
            else {
                let nluData = {
                    nluType: nluType,
                    asr: asr,
                    intent: '',
                    parameters: {}
                };
                console.log(`HUB: getIntent: NO NLU DEFINED: nluData`, nluData);
                resolve(nluData);
            }
        });
    }
    get robotSerialName() {
        return this.robot.serialName;
    }
}
exports.default = Hub;
//# sourceMappingURL=Hub.js.map