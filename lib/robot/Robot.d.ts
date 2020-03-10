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
    INIT = 0,
    IDLE = 1,
    LOGGING_IN = 2,
    LOGGED_IN = 3,
    LOGIN_ERROR = 4,
    GETTING_ROBOT = 5,
    GOT_ROBOT = 6,
    GET_ROBOT_ERROR = 7,
    REQUESTING_CERTIFICATE = 8,
    RECEIVED_CERTIFICATE = 9,
    CERTIFICATE_ERROR = 10,
    CONNECTING = 11,
    CONNECTED = 12,
    CONNECT_ERROR = 13,
    DISCONNECTING = 14,
    DISCONNECT_ERROR = 15,
    MAX_CONNECT_ERRORS = 16,
    FUNKY = 17
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
    state: string;
    autoReconnect: boolean;
    keepAlive: boolean;
    connectErrorCount: number;
    errorCount: number;
    lastError: any;
    trackingMotion: boolean;
    trackingFaces: boolean;
    aliveTime: number;
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
    private _startTime;
    private _reconnectCooldownStart;
    private _reconnectCooldownDuration;
    private _reconnectCooldownTimeout;
    private _connectErrorCount;
    private _maxConnectErrors;
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
    get maxConnectErrors(): number;
    set maxConnectErrors(value: number);
    private reportError;
    get errorCount(): number;
    getLastError(count?: number): RobotError | RobotError[];
    clearErrors(): void;
    setState(state: RobotState): void;
    get state(): RobotState;
    get stateName(): string;
    get hub(): Hub;
    initWithData(data: RobotData): void;
    updateRobotStatusMessagesWithType(type: 'info' | 'error', message: string | Object, subsystem?: string, clearMessages?: boolean): void;
    updateRobotStatusMessages(message: string | Object, subsystem?: string, clearMessages?: boolean): void;
    updateRobotStatusMessagesError(message: string | Object, subsystem?: string, clearMessages?: boolean): void;
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
    get reconnectCooldownDuration(): number;
    set reconnectCooldownDuration(value: number);
    get reconnectCooldownTimeRemaining(): number;
    reconnectAfterCooldown(resetCooldown?: boolean): void;
    tryReconnect(): void;
    loginToAccount(creds: JiboAccountCreds): Promise<JiboAccount>;
    getRobot(account: JiboAccount, name: string): Promise<JiboRobotConnection>;
    handleOnDisconnected(): void;
    disconnect(): void;
    get connected(): boolean;
    get targeted(): boolean;
    set targeted(value: boolean);
    toggleTargeted(): void;
    get requester(): any | undefined;
    mute(state?: boolean): void;
    status(): RobotStats;
}
