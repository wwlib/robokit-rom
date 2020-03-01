/// <reference types="../typings" />
/// <reference types="node" />
import { EventEmitter } from "events";
import Skill from './Skill';
import Robot from '../robot/Robot';
import LUISController from '../nlu/luis/LUISController';
import DialogflowControllerV1 from '../nlu/dialogflow/DialogflowControllerV1';
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
export default class Hub extends EventEmitter {
    robot: Robot;
    skillMap: Map<string, Skill | undefined>;
    launchIntentMap: Map<string, Skill | undefined>;
    hjToken: any;
    dialogflowController: DialogflowControllerV1;
    luisController: LUISController;
    tickInterval: any;
    startTickTime: number;
    previousTickTime: number;
    sessionId: string;
    constructor(robot: Robot);
    tick(): void;
    onRobotConnected(): void;
    registerSkill(skill: Skill): void;
    removeSkill(skill: Skill): void;
    onHotwordEvent(hotwordData: HotwordData): void;
    getLaunchIntent(asr: string): Promise<any>;
    getIntent(asr: string, contexts: string[], nluType: string): Promise<NluData>;
    get robotSerialName(): string;
}
