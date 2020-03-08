/// <reference types="../typings" />
/// <reference types="node" />
import { EventEmitter } from "events";
import Skill from './Skill';
import Robot, { RobotDataStreamEvent } from '../robot/Robot';
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
export interface HubStats {
    robotName: string;
    skillNames: string[];
    launchIntents: string[];
    sessionId: string;
}
export default class Hub extends EventEmitter {
    robot: Robot;
    skillMap: Map<string, Skill | undefined>;
    launchIntentMap: Map<string, Skill | undefined>;
    hjToken: any;
    dialogflowController: DialogflowControllerV1;
    luisController: LUISController;
    _sessionId: string;
    private _tickFrequency;
    private _tickInterval;
    private _startTickTime;
    private _previousTickTime;
    constructor(robot: Robot);
    get tickFrequency(): number;
    set tickFrequency(value: number);
    tick(): void;
    clearTick(): void;
    resetTick(): void;
    onRobotConnected(): void;
    onRobotDataStreamEvent(event: RobotDataStreamEvent): void;
    registerSkill(skill: Skill): void;
    removeSkill(skill: Skill): void;
    onHotwordEvent(hotwordData: HotwordData): void;
    getLaunchIntent(asr: string): Promise<any>;
    getIntent(asr: string, contexts: string[], nluType: string): Promise<NluData>;
    get robotSerialName(): string;
    get sessionId(): string;
    status(): HubStats;
}
