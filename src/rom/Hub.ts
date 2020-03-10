import { EventEmitter } from "events";
import Skill from './Skill';
import Robot, { RobotIntentData, RobotDataStreamEvent } from '../robot/Robot';

import NLUController, {
    NLUIntentAndEntities
} from './NLUController';
import LUISController from '../nlu/luis/LUISController';
import DialogflowControllerV1 from '../nlu/dialogflow/DialogflowControllerV1';
// import DialogflowControllerV2 from '../nlu/dialogflow/DialogflowControllerV2';

import PersistenceManager from './PersistenceManager';

// import ClockSkill from '../rom/ClockSkill';
import JokeSkill from './JokeSkill';
import EnsembleSkillManager from './EnsembleSkillManager';
import EnsembleSkill from './EnsembleSkill';
import UserLikesSkill from './UserLikesSkill'

export interface HotwordData {
    listenResultEvent: JIBO.v1.ListenResultEvent;
    speaker: any;
}

export interface NluData {
    nluType: string;
    asr: string;
    intent: string;
    parameters: any;
}

export interface HubStats {
    robotName: string;
    skillNames: string[];
    launchIntents: string[];
    sessionId: string;
}

export default class Hub extends EventEmitter {

    public robot: Robot;
    public skillMap: Map<string, Skill | undefined>;
    public launchIntentMap: Map<string, Skill | undefined>;
    public hjToken: any;
    public dialogflowController = new DialogflowControllerV1();
    public luisController = new LUISController();
    public _sessionId: string = `robot_${Math.floor(Math.random() * 10000)}`;

    private _tickFrequency: number = 1000;
    private _tickInterval: any;
    private _startTickTime: number;
    private _previousTickTime: number;

    constructor(robot: Robot) {
        super();
        this.robot = robot;
        this.skillMap = new Map<string, Skill>();
        this.launchIntentMap = new Map<string, Skill>();

        PersistenceManager.Instance;

        this._startTickTime = new Date().getTime();
        this._previousTickTime = this._startTickTime;
        this.resetTick();
    }

    get tickFrequency(): number {
        return this._tickFrequency;
    }

    set tickFrequency(value: number) {
        this._tickFrequency = value;
        this.resetTick();
    }

    tick(): void {
        this.skillMap.forEach((skill: Skill | undefined, key: string) => {
            if (skill && skill.running) {
                let time: number = new Date().getTime();
                let frameTime: number = time - this._previousTickTime;
                let elapsedTime: number = time - this._startTickTime;
                this._previousTickTime = time;
                skill.tick(frameTime, elapsedTime);
            }
        });
    }

    clearTick(): void {
        if (this._tickInterval) {
            clearInterval(this._tickInterval)
            this._tickInterval = undefined;
        }
    }

    resetTick(): void {
        this.clearTick();
        this._tickInterval = setInterval(this.tick.bind(this), this._tickFrequency);
    }

    onRobotConnected(): void {
        if (this.robot.requester && this.robot.requester.listen) {
            if (this.robot.romApp) {
                PersistenceManager.Instance.connect(this.robot.romApp, true);
                this.dialogflowController.config = this.robot.romApp;
                this.luisController.config = this.robot.romApp;
            }

            this.hjToken = this.robot.requester.listen.subscribe.hotword();
            this.hjToken.hotWordHeard.on((speaker: any) => {
                this.robot.updateRobotStatusMessages('Heard Hotword from speaker:', 'HUB')
                this.robot.updateRobotStatusMessages(speaker, 'HUB');
                this.robot.resetKeepAlive();
                if (this.robot.requester) {
                    let listenToken = this.robot.requester.listen.start();
                    listenToken.update.on((listenResultEvent: JIBO.v1.ListenResultEvent | undefined) => {
                        this.robot.updateRobotStatusMessages('Hey! I think i heard something:', 'HUB')
                        if (listenResultEvent) {
                            this.robot.updateRobotStatusMessages(listenResultEvent.Speech, 'HUB');
                        }
                        if (listenResultEvent) {
                            let hotWordData: HotwordData = { speaker: speaker, listenResultEvent: listenResultEvent };
                            this.onHotwordEvent(hotWordData)
                        }
                    });
                }
            });
        }
        this.registerSkill(new UserLikesSkill(this.robot));
        this.registerSkill(new JokeSkill(this.robot));
        let clockEnsembleSkill: EnsembleSkill | undefined = EnsembleSkillManager.Instance.getEnsembleSkillWithId('clockEnsemble');
        if (clockEnsembleSkill) {
            this.registerSkill(clockEnsembleSkill);
            clockEnsembleSkill.addHub(this);
        }
    }

    onRobotDataStreamEvent(event: RobotDataStreamEvent) {
        // if (event && event.type === 'faceGained') {
        //     console.log(`onRobotDataStreamEvent: ${event.type}`);
        // }
        this.emit('dataStreamEvent', event);
    }

    registerSkill(skill: Skill): void {
        this.robot.updateRobotStatusMessages('registerSkill', 'HUB')
        this.robot.updateRobotStatusMessages(skill, 'HUB');
        this.skillMap.set(skill.id, skill);
        this.launchIntentMap.set(skill.launchIntent, skill);
    }

    removeSkill(skill: Skill): void {
        this.skillMap.set(skill.id, undefined);
        this.skillMap.delete(skill.id);
    }

    onHotwordEvent(hotwordData: HotwordData): void {
        // get intent from asrTranscript
        this.robot.updateRobotStatusMessages('onHotwordEvent', 'HUB')
        this.robot.updateRobotStatusMessages(hotwordData, 'HUB');
        let userId: string = 'someone';
        let asr: string = hotwordData.listenResultEvent.Speech;
        this.getLaunchIntent(asr)
            .then((nluData: any) => {
                if (nluData && nluData.intent) {
                    let launchIntent = nluData.intent;
                    let launchId: string = `${new Date().getTime()}`;
                    let skill: Skill | undefined = this.launchIntentMap.get(launchIntent);
                    let robotIntentData: RobotIntentData = { nluType: nluData.nluType, asr: asr, intent: launchIntent, launchId: launchId, nluData: nluData, userId: userId };
                    this.robot.updateRobotStatusMessages('onHotwordEvent: robotIntentData', 'HUB')
                    this.robot.updateRobotStatusMessages(robotIntentData, 'HUB');
                    if (skill) {
                        skill.launch(robotIntentData);
                        skill.running = true;
                        PersistenceManager.Instance.persistLaunchIntent(this.robot.name, userId, launchIntent, launchId);
                    } else {
                        this.robot.updateRobotStatusMessages('onHotwordEvent: passing to robot onLaunchEvent', 'HUB')
                        this.robot.updateRobotStatusMessages(robotIntentData, 'HUB');
                        this.robot.onLaunchIntent(robotIntentData);
                    }
                }
            })
            .catch((err: any) => {
                this.robot.updateRobotStatusMessagesError('onHotwordEvent: error', 'HUB')
                this.robot.updateRobotStatusMessagesError(err, 'HUB');
            });
    }

    getLaunchIntent(asr: string): Promise<any> {
        let nluDefault: string = 'none';
        if (this.robot.romApp && this.robot.romApp.nluDefault) {
            nluDefault = this.robot.romApp.nluDefault;
        }

        return this.getIntent(asr, ['launch'], nluDefault);
    }

    getIntent(asr: string, contexts: string[], nluType: string): Promise<NluData> {
        this.robot.updateRobotStatusMessages(`getIntent: asr: ${asr}, ${nluType}, contexts:`, 'HUB')
        this.robot.updateRobotStatusMessages(contexts, 'HUB');
        return new Promise((resolve, reject) => {
            let query: string = asr;
            let nluController: NLUController | undefined = undefined;
            if (nluType == 'luis') {
                nluController = this.luisController;
            } else if (nluType == 'dialogflow') {
                nluController = this.dialogflowController;
            }

            if (nluController) {
                let context: string = '';
                if (contexts) {
                    context = contexts[0];
                }
                nluController.getIntentAndEntities(query, 'en-US', context, this._sessionId)
                    .then((intentAndEntities: NLUIntentAndEntities) => {
                        let nluData: NluData = {
                            nluType: nluType,
                            asr: asr,
                            intent: intentAndEntities.intent,
                            parameters: intentAndEntities.entities
                        }
                        this.robot.updateRobotStatusMessages(`getIntent: nluData`, 'HUB')
                        this.robot.updateRobotStatusMessages(nluData, 'HUB');
                        resolve(nluData);
                    })
                    .catch((err: any) => {
                        reject(err);
                    });
            } else {
                let nluData: NluData = {
                    nluType: nluType,
                    asr: asr,
                    intent: '',
                    parameters: {}
                }
                this.robot.updateRobotStatusMessages(`getIntent: NO NLU DEFINED: nluData`, 'HUB')
                this.robot.updateRobotStatusMessages(nluData, 'HUB');
                resolve(nluData)
            }
        });
    }

    get robotSerialName(): string {
        return this.robot.serialName;
    }

    get sessionId(): string {
        return this._sessionId;
    }

    status(): HubStats {
        return {
            robotName: this.robot ? this.robot.name : '',
            skillNames: Array.from(this.skillMap.keys()),
            launchIntents: Array.from(this.launchIntentMap.keys()),
            sessionId: this._sessionId
        }
    }
}
