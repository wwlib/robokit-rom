/// <reference types="node" />
import { EventEmitter } from "events";
import IRomApp from '../rom/IRomApp';
import RomCommand from '../rom/RomCommand';
import Hub from '../rom/Hub';
import RobokitConnection from './RobokitConnection';
import { Account as JiboAccount, AccountCreds as JiboAccountCreds, Robot as JiboRobotConnection } from '@jibo/apptoolkit-library';
export declare enum RobotType {
    jibo = "jibo",
    robokit = "robokit"
}
export interface RobotData {
    type: string;
    name: string;
    ip: string;
    serialName: string;
    email: string;
    password: string;
}
export declare enum RobotIntentType {
    LAUNCH = 0,
    LISTEN = 1,
    ACTION_COMPLETE = 2
}
export interface RobotIntentData {
    nluType: string;
    asr: string;
    intent: string;
    launchId: string | undefined;
    nluData: any | undefined;
    userId: string | undefined;
}
export interface RobotIntent {
    robot: Robot;
    type: RobotIntentType;
    data: RobotIntentData;
}
export interface RobotDataStreamEvent {
    robotId: string;
    type: string;
    data: any;
}
export default class Robot extends EventEmitter {
    private _type;
    name: string;
    ip: string;
    serialName: string;
    email: string;
    password: string;
    romApp: IRomApp | undefined;
    protected _connected: boolean;
    protected _targeted: boolean;
    protected _robotConnection: JiboRobotConnection | RobokitConnection | undefined;
    protected _hub: Hub;
    private _number;
    private _muted;
    private _motionTrackToken;
    private _faceTrackToken;
    private _stateData;
    private _keepAliveInterval;
    constructor(options?: RobotData);
    get type(): string;
    set type(typeString: string);
    initWithData(data: RobotData): void;
    updateRobotStatusMessages(message: string, subsystem?: string, clearMessages?: boolean): string;
    get number(): number;
    set number(number: number);
    get json(): RobotData;
    updateUserData(userId: string, userName: string): void;
    get userData(): any;
    updateStateData(data: any): any;
    get stateData(): any;
    set stateData(data: any);
    onLaunchIntent(robotIntentData: RobotIntentData): void;
    onListenIntent(robotIntentData: RobotIntentData): void;
    sendCommand(command: RomCommand): void;
    keepAlive(): void;
    clearKeepAlive(): void;
    resetKeepAlive(): void;
    connect(romApp: IRomApp): void;
    loginToAccount(creds: JiboAccountCreds): Promise<JiboAccount>;
    getRobot(account: JiboAccount, name: string): Promise<JiboRobotConnection>;
    disconnect(): void;
    get connected(): boolean;
    get targeted(): boolean;
    get requester(): any | undefined;
    toggleTargeted(): void;
    mute(state?: boolean): void;
}
