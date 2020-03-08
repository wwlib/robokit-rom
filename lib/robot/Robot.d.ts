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
export declare enum RobotState {
    IDLE = 0,
    LOGGING_IN = 1,
    LOGGED_IN = 2,
    LOGIN_ERROR = 3,
    REQUESTING_CERTIFICATE = 4,
    CERTIFICATE_ERROR = 5,
    CONNECTING = 6,
    CONNECTED = 7,
    CONNECT_ERROR = 8,
    DISCONNECTING = 9,
    DISCONNECTED = 10,
    DISCONNECT_ERROR = 11
}
export interface RobotStats {
    name: string;
    ip: string;
    type: string;
    serialName: string;
    number: number;
    connected: boolean;
    targeted: boolean;
    muted: boolean;
    state: RobotState;
    autoReconnect: boolean;
    keepAlive: boolean;
    connectErrorCount: number;
    errorCount: number;
    lastError: any;
    trackingMotion: boolean;
    trackingFaces: boolean;
}
export interface RobotError {
    state: string;
    error: string;
    timestamp: number;
}
export default class Robot extends EventEmitter {
    private _keepAliveFrequency;
    private _state;
    private _type;
    name: string;
    ip: string;
    serialName: string;
    email: string;
    password: string;
    private _romApp;
    protected _connected: boolean;
    protected _autoReconnect: boolean;
    protected _targeted: boolean;
    protected _robotConnection: JiboRobotConnection | RobokitConnection | undefined;
    protected _hub: Hub;
    private _number;
    private _muted;
    private _motionTrackToken;
    private _faceTrackToken;
    private _stateData;
    private _keepAliveInterval;
    private _connectErrorCount;
    private _errors;
    constructor(options?: RobotData);
    get romApp(): IRomApp | undefined;
    set romApp(value: IRomApp | undefined);
    get type(): string;
    set type(typeString: string);
    get autoReconnect(): boolean;
    set autoReconnect(value: boolean);
    get keepAliveFrequency(): number;
    set keepAliveFrequency(value: number);
    get errors(): RobotError[];
    private reportError;
    get errorCount(): number;
    getLastError(count?: number): RobotError | RobotError[];
    clearErrors(): void;
    get hub(): Hub;
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
    set targeted(value: boolean);
    toggleTargeted(): void;
    get requester(): any | undefined;
    mute(state?: boolean): void;
    status(): RobotStats;
}
