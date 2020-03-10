import { EventEmitter } from "events";
import IRomApp from '../rom/IRomApp';
import RomCommand from '../rom/RomCommand';
import Hub, { NluData } from '../rom/Hub';
import Logger from '../Logger';

const fs = require('fs');
const http = require('http');

import RobokitConnection from './RobokitConnection';
import {
    Account as JiboAccount,
    AccountCreds as JiboAccountCreds,
    Robot as JiboRobotConnection
} from '@jibo/apptoolkit-library';

import { CommandRequester } from '@jibo/command-requester';

export enum RobotType {
    jibo = 'jibo',
    robokit = 'robokit'
}

export interface RobotData {
    type: string;
    name: string;
    ip: string;
    serialName: string;
    email: string;
    password: string;
}

export enum RobotIntentType {
    LAUNCH,
    LISTEN,
    ACTION_COMPLETE
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

export enum RobotState {
    INIT,
    IDLE,
    LOGGING_IN,
    LOGGED_IN,
    LOGIN_ERROR,
    GETTING_ROBOT,
    GOT_ROBOT,
    GET_ROBOT_ERROR,
    REQUESTING_CERTIFICATE,
    RECEIVED_CERTIFICATE,
    CERTIFICATE_ERROR,
    CONNECTING,
    CONNECTED,
    CONNECT_ERROR,
    DISCONNECTING,
    // DISCONNECTED,
    DISCONNECT_ERROR,
    MAX_CONNECT_ERRORS,
    FUNKY
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

    private _keepAliveFrequency: number = 60000;

    private _state: RobotState;
    private _type: string = 'jibo';
    public name: string = '';
    public ip: string = '';
    public serialName: string = '';
    public email: string = '';
    public password: string = '';

    private _romApp: IRomApp | undefined;

    protected _connected: boolean;
    protected _autoReconnect: boolean;
    protected _targeted: boolean;
    protected _robotConnection: JiboRobotConnection | RobokitConnection | undefined;
    protected _hub: Hub;
    private _number: number = 0;
    private _muted: boolean = false;

    private _motionTrackToken: any;
    private _faceTrackToken: any;

    private _stateData: any
    private _keepAliveInterval: any;
    private _startTime: number;
    private _reconnectCooldownStart: number;
    private _reconnectCooldownDuration: number;
    private _reconnectCooldownTimeout: number | undefined;

    private _connectErrorCount: number = 0;
    private _maxConnectErrors: number = 3;

    private _errors: RobotError[];

    constructor(options?: RobotData) {
        super();
        this._startTime = new Date().getTime();
        this._reconnectCooldownDuration = 20000;
        this._reconnectCooldownStart = 0;
        options = options || {
            type: this.type,
            name: this.name,
            ip: this.ip,
            serialName: this.serialName,
            email: this.email,
            password: this.password,
        }
        this.initWithData(options);
        this._connected = false;
        this._autoReconnect = false;
        this._targeted = false;
        this._hub = new Hub(this);
        this._stateData = { userId: '', userName: '' };
        this._state = RobotState.INIT;
        this.setState(RobotState.IDLE);
        this._errors = [];
    }

    get romApp(): IRomApp | undefined {
        return this._romApp;
    }

    set romApp(value: IRomApp | undefined) {
        this._romApp = value;
    }

    get type(): string {
        return this._type;
    }

    set type(typeString: string) {
        this._type = typeString;
    }

    get autoReconnect(): boolean {
        return this._autoReconnect;
    }

    set autoReconnect(value: boolean) {
        this._autoReconnect = value;
    }

    get keepAliveFrequency(): number {
        return this._keepAliveFrequency;
    }

    set keepAliveFrequency(value: number) {
        this._keepAliveFrequency = value;
        this.resetKeepAlive();
    }

    get errors(): RobotError[] {
        return this._errors;
    }

    get maxConnectErrors(): number {
        return this._maxConnectErrors;
    }

    set maxConnectErrors(value: number) {
        this._maxConnectErrors = value;
        this._connectErrorCount = 0;
    }

    private reportError(error: string, state?: RobotState) {
        const errorState: RobotState = state || this._state;
        const errorStateKey: string = RobotState[errorState];
        const robotError: RobotError = {
            state: errorStateKey,
            error: error,
            timestamp: new Date().getTime(),
        }
        this._errors.unshift(robotError);
    }

    get errorCount(): number {
        return this._errors.length;
    }

    getLastError(count: number = 1): RobotError | RobotError[] {
        let result: RobotError | RobotError[] = this._errors[0];
        if (count > 1) {
            result = this._errors.slice(0, count);
        }
        return result;
    }

    clearErrors() {
        this._errors = [];
    }

    setState(state: RobotState) {
        if (state != this._state) {
            // transition
            const oldState: string = RobotState[this._state];
            const newState: string = RobotState[state];
            this.updateRobotStatusMessages(`${oldState} -> ${newState}`)
        }
        this._state = state;
    }

    get state(): RobotState {
        return this._state;
    }

    get stateName(): string {
        return RobotState[this._state];
    }

    get hub(): Hub {
        return this._hub;
    }

    initWithData(data: RobotData): void {
        this.type = data.type || 'jibo';
        this.name = data.name;
        this.ip = data.ip;
        this.serialName = data.serialName;
        this.email = data.email;
        this.password = data.password;
    }

    updateRobotStatusMessagesWithType(type: 'info' | 'error', message: string | Object, subsystem: string = '', clearMessages: boolean = false) {
        const robotName: string = this.name;
        let subsystemString: string = subsystem ? `<${subsystem}> ` : '';
        let statusMessage: string = '';
        if (typeof message === 'string') {
            statusMessage = `${subsystemString}${message}`;
        } else {
            try {
                statusMessage = `${subsystemString} ${JSON.stringify(message, null, 2)}`;
            } catch (error) {
                statusMessage = `${error}`;
            }
        }
        if (type === 'info') {
            Logger.info([statusMessage], robotName);
        } else {
            Logger.error([statusMessage], robotName);
        }
        this.emit('statusMessage', { message: statusMessage, subsystem: subsystem, type: type });
    }

    updateRobotStatusMessages(message: string | Object, subsystem: string = '', clearMessages: boolean = false) {
        this.updateRobotStatusMessagesWithType('info', message, subsystem, clearMessages);
    }

    updateRobotStatusMessagesError(message: string | Object, subsystem: string = '', clearMessages: boolean = false) {
        this.updateRobotStatusMessagesWithType('error', message, subsystem, clearMessages);
    }

    get number(): number {
        return this._number;
    }

    set number(number: number) {
        this._number = number;
    }

    get json(): RobotData {
        let json: RobotData = {
            type: this.type,
            name: this.name,
            ip: this.ip,
            serialName: this.serialName,
            email: this.email,
            password: this.password,
        };
        return json;
    }

    //// _stateData
    // TODO: Rename StateData to ContextData

    updateUserData(userId: string, userName: string): void {
        this._stateData.userId = userId;
        this._stateData.userName = userName;
    }

    get userData(): any {
        return { userId: this._stateData.userId, userName: this._stateData.userName };
    }

    updateStateData(data: any): any {
        this._stateData = Object.assign(this._stateData, data);
    }

    // session Conext Data
    get stateData(): any {
        return this._stateData;
    }

    // session Conext Data
    set stateData(data: any) {
        this._stateData = data;
    }

    onLaunchIntent(robotIntentData: RobotIntentData): void {
        let robotIntent: RobotIntent = { robot: this, type: RobotIntentType.LAUNCH, data: robotIntentData };
        this.emit('robotIntent', robotIntent);
    }

    onListenIntent(robotIntentData: RobotIntentData): void {
        let robotIntent: RobotIntent = { robot: this, type: RobotIntentType.LISTEN, data: robotIntentData };
        this.emit('robotIntent', robotIntent);
    }

    sendCommand(command: RomCommand): void {
        this.resetKeepAlive();
        if (this._robotConnection) {
            try {
                switch (command.type) {
                    case "say":
                    case "tts":
                        if (!this._muted && command.data && (command.data.text || command.data.prompt)) {
                            let prompt: string = command.data.text || command.data.prompt;
                            let p = this._robotConnection.requester.expression.say(prompt).complete;
                            p.then(() => {
                                // console.log(`Robot: sendCommand: done`);
                                let robotIntentData: RobotIntentData = { nluType: 'none', asr: '', intent: 'OK', launchId: undefined, nluData: undefined, userId: undefined };
                                let robotIntent: RobotIntent = { robot: this, type: RobotIntentType.ACTION_COMPLETE, data: robotIntentData };
                                this.emit('robotIntent', robotIntent);
                            })
                                .catch((result: any) => {
                                    this.updateRobotStatusMessagesError(result);
                                });
                        }
                        break;
                    case "ask":
                        if (!this._muted && command.data && command.data.prompt) {
                            let prompt: string = command.data.prompt;
                            let contexts: string[] = command.data.contexts || [];
                            let nluDefault: string = 'none';
                            if (this._romApp && this._romApp.nluDefault) {
                                nluDefault = this._romApp.nluDefault;
                            }
                            let nluType: string = command.data.nluType || nluDefault;
                            let p = this._robotConnection.requester.expression.say(prompt).complete;
                            p.then(() => {
                                if (this._robotConnection) {
                                    let listenToken = this._robotConnection.requester.listen.start();
                                    listenToken.update.on((listenResultEvent: JIBO.v1.ListenResultEvent | undefined) => {
                                        this.updateRobotStatusMessages(`Robot: ask: Heard: ${listenResultEvent ? listenResultEvent.Speech : ''}`);
                                        if (listenResultEvent && listenResultEvent.Event == 'onListenResult' && listenResultEvent.Speech) {
                                            let robotIntentData: RobotIntentData = { nluType: nluType, asr: listenResultEvent.Speech, intent: '', launchId: undefined, nluData: undefined, userId: undefined };
                                            if (nluType != 'none') {
                                                this._hub.getIntent(listenResultEvent.Speech, contexts, nluType)
                                                    .then((nluData: NluData) => {
                                                        robotIntentData.intent = nluData.intent;
                                                        robotIntentData.nluData = nluData;
                                                        this.onListenIntent(robotIntentData);
                                                    })
                                                    .catch((err: string) => {
                                                        this.updateRobotStatusMessages('Robot: ask: getIntent: error:');
                                                        this.updateRobotStatusMessages(err);
                                                    })
                                            } else {
                                                this.onListenIntent(robotIntentData);
                                            }
                                        } else {
                                            this.updateRobotStatusMessagesError('Error: invalid listen result: ask');
                                        }
                                    });
                                } else {
                                    this.updateRobotStatusMessagesError('Error starting listen for command: ask');
                                }
                            })
                                .catch((result: any) => {
                                    this.updateRobotStatusMessagesError(result);
                                });


                        }
                        break;
                    case "lookAtPosition":
                    case "lookAt":
                        if (!this._muted && command.data && (command.data.angle || command.data.vector)) {
                            let p;
                            if (command.data.angle) {
                                let angleVector: CommandRequester.AngleVector = { theta: command.data.angle, psi: 0 };
                                let lookAtTarget: CommandRequester.expression.LookAtTarget = { type: "ANGLE", angle: angleVector, levelHead: true };
                                p = this._robotConnection.requester.expression.look(lookAtTarget).complete;
                            } else if (command.data.vector) {
                                let vector: CommandRequester.Vector3 = { x: command.data.vector[0], y: command.data.vector[1], z: command.data.vector[2] }
                                let position: CommandRequester.expression.Position = { type: "POSITION", position: vector, levelHead: true };
                                p = this._robotConnection.requester.expression.look(position).complete;
                            }
                            if (p) {
                                p.then(() => {
                                    // console.log(`Robot: sendCommand: done`);
                                })
                                    .catch((result: any) => {
                                        this.updateRobotStatusMessagesError(result);
                                    });
                            }
                        }
                        break;
                    case "attention":
                        if (!this._muted && command.data && command.data.state) {
                            let mode: JIBO.v1.AttentionModes.AttentionModeType = 'OFF';
                            switch (command.data.state) {
                                case "OFF":
                                    mode = 'OFF';
                                    break;
                                case "IDLE":
                                    mode = 'IDLE'
                            }
                            let p = this._robotConnection.requester.expression.setAttention(mode as any).complete
                            p.then(() => {
                                // console.log(`Robot: sendCommand: done`);
                            })
                                .catch((result: any) => {
                                    this.updateRobotStatusMessagesError(result);
                                });
                        }
                        break;
                    case "volume":
                        if (!this._muted && command.data && command.data.volume) {
                            let configOptions: CommandRequester.config.SetConfigOptions = {
                                mixer: Number(command.data.volume)
                            };
                            let p = this._robotConnection.requester.config.set(configOptions).complete;
                            p.then(() => {
                                // console.log(`Robot: sendCommand: done`);
                            })
                                .catch((result: any) => {
                                    this.updateRobotStatusMessagesError(result);
                                });
                        }
                        break;
                    case "mute":
                        this.mute(true);
                        break;
                    case "unmute":
                        this.mute(false);
                        break;
                    case "image":
                        if (!this._muted && command.data && command.data.url) {
                            let data: JIBO.v1.ImageView = {
                                Type: "Image", //DisplayViewType.Image,
                                Name: command.data.name,
                                Image: {
                                    name: command.data.name,
                                    src: command.data.url
                                }

                            }
                            let p = this._robotConnection.requester.display.swap(data).complete;
                            p.then(() => {
                                // console.log(`Robot: sendCommand: done`);
                            })
                                .catch((result: any) => {
                                    this.updateRobotStatusMessagesError(result);
                                });
                        }
                        break;
                    case "eye":
                        if (!this._muted) {
                            let data: JIBO.v1.EyeView = {
                                Type: "Eye", //DisplayViewType.Eye,
                                Name: "eye"
                            }
                            let p = this._robotConnection.requester.display.swap(data).complete;
                            p.then(() => {
                                // console.log(`Robot: sendCommand: done`);
                            })
                                .catch((result: any) => {
                                    this.updateRobotStatusMessagesError(result);
                                });
                        }
                        break;
                    case "motion":
                        if (!this._muted && command.data && command.data.state) {
                            if (command.data.state == 'ON') {
                                if (!this._motionTrackToken) {
                                    this._motionTrackToken = this._robotConnection.requester.perception.subscribe.motion()  //this._requester.motionTrack.trackMotions();
                                    this._motionTrackToken.update.on((detectedMotions: any) => {
                                        // TODO:
                                    });
                                }
                            } else if (command.data.state == 'OFF') {
                                if (this._motionTrackToken) {
                                    this._motionTrackToken.cancel();
                                    this._motionTrackToken = undefined;
                                }
                            }
                        }
                        break;
                    case "faces":
                        if (!this._muted && command.data && command.data.state) {
                            this.updateRobotStatusMessages(`Robot: faces: ${command.data.state}`);
                            if (command.data.state == 'ON') {
                                this._faceTrackToken = this._robotConnection.requester.perception.subscribe.face() //this._requester.faceTrack.trackFaces();
                                this._faceTrackToken.gained.on((detectedEntities: any) => {
                                    if (detectedEntities.length > 0) {
                                        this.updateRobotStatusMessages(`Robot: faces: detectedFaces: gained: count: ${detectedEntities.length}`);
                                        if (this._hub) {
                                            this._hub.onRobotDataStreamEvent({
                                                robotId: this.serialName,
                                                type: 'faceGained',
                                                data: detectedEntities
                                            });
                                        }
                                    }

                                });
                                this._faceTrackToken.update.on((updatedEntities: any) => {
                                    if (updatedEntities.length > 0) {
                                        if (this._hub) {
                                            this._hub.onRobotDataStreamEvent({
                                                robotId: this.serialName,
                                                type: 'faceUpdated',
                                                data: updatedEntities
                                            });
                                        }
                                    }
                                });
                            } else if (command.data.state == 'OFF') {
                                if (this._faceTrackToken) {
                                    this._faceTrackToken.cancel();
                                    this._faceTrackToken = undefined;
                                }
                            }
                        }
                        break;
                    case "photo":
                        // console.log(this._robotConnection.requester);
                        // console.log(this._robotConnection.requester.media.capture);
                        // console.log(this._robotConnection.requester.media.capture.photoRequest);
                        try {
                            let p = this._robotConnection.requester.media.capture.photo().complete;  //photo.takePhoto().complete;
                            p.then((data: any) => {
                                const uri = data.URI;
                                // console.log(data);
                                this.updateRobotStatusMessages(`Robot: photo: photo ready - uri: ${uri}`);
                                //start getting the thing
                                const file = fs.createWriteStream('./PhotoIzHere.jpg');
                                http.get({
                                    hostname: this.ip,
                                    port: 8160, //7160, //8160,
                                    path: uri
                                }, (response: any) => {
                                    response.pipe(file);
                                    this.updateRobotStatusMessages('Robot: photo: Your photo was saved as PhotoIzHere.jpg');
                                    // var cp = require("child_process");
                                    // cp.exec("open PhotoIzHere.jpg");
                                });
                            })
                                .catch((result: any) => {
                                    this.updateRobotStatusMessagesError(result);
                                });
                        } catch (err) {
                            this.updateRobotStatusMessagesError(err);
                        }
                        break;
                }
            } catch (err) {
                this.updateRobotStatusMessagesError(`Robot: sendCommand: try: error:`);
                this.updateRobotStatusMessagesError(err);
            }
        }
    }

    keepAlive(): void {
        this.updateRobotStatusMessages(`keepAlive`);
        let command: RomCommand = new RomCommand("", "say", { text: '.' });
        this.sendCommand(command);
    }

    clearKeepAlive(): void {
        if (this._keepAliveInterval) {
            clearInterval(this._keepAliveInterval)
            this._keepAliveInterval = undefined;
        }
    }

    resetKeepAlive(): void {
        this.clearKeepAlive();
        this._keepAliveInterval = setInterval(this.keepAlive.bind(this), this._keepAliveFrequency);
    }

    connect(romApp: IRomApp): void {
        Logger.info(['\n\n            ************ CONNECTING ************\n\n'], this.name);
        this._romApp = romApp;
        if (this._connected) {
            this.disconnect();
        }
        let creds: JiboAccountCreds = {
            clientId: this._romApp.clientId,
            clientSecret: this._romApp.clientSecret,
            email: this.email,
            password: this.password,
        };
        this.loginToAccount(creds)
            .then((account: JiboAccount) => {
                this.updateRobotStatusMessages(`logged in`);
                this.setState(RobotState.LOGGED_IN);
                this.getRobot(account, this.serialName)
                    .then((connection: JiboRobotConnection) => {
                        this.setState(RobotState.GOT_ROBOT);
                        this._robotConnection = connection;
                        this._robotConnection.on('status', (status: string) => {
                            this.updateRobotStatusMessages(`connection: status: ${status}`);
                            if (status === 'certificateRequested') {
                                this.setState(RobotState.REQUESTING_CERTIFICATE);
                            } else if (status === 'certificateReceived') {
                                this.setState(RobotState.RECEIVED_CERTIFICATE);
                            } else if (status === 'disconnected') {
                                this.handleOnDisconnected();
                            }
                        });
                        this.setState(RobotState.CONNECTING);
                        this._robotConnection.connect()
                            .then(() => {
                                if (this._robotConnection) {
                                    this.updateRobotStatusMessages(`Robot: connected!`);
                                    this.setState(RobotState.CONNECTED);
                                    Logger.info(['\n\n            ************ CONNECTED ************\n\n'], this.name);
                                    const connectionObj: any = this._robotConnection;
                                    this.ip = connectionObj['_ip'];
                                    // this._robotConnection.on('disconnect', () => { // TODO: Does this ever get called?
                                    //     this.updateRobotStatusMessages('Robot: disconnected.');
                                    //     this._connected = false;
                                    // });
                                    this._connected = true;
                                    this._targeted = true;
                                    this._hub.onRobotConnected();
                                    this.emit('updateRobot', this);
                                    this.resetKeepAlive();
                                } else {
                                    this.updateRobotStatusMessagesError(`Robot: this._robotConnection.connect(): then: error: _robotConnection undefined.`);
                                    // Redundant?: Not needed. Handled by status events.
                                    // this.setState(RobotState.CONNECT_ERROR);
                                    // this.handleOnConnectError();
                                }
                            })
                            .catch((err: Error) => {
                                this.updateRobotStatusMessagesError('Robot: this._robotConnection.connect(): catch:');
                                this.updateRobotStatusMessagesError(err.message);
                                // Redundant?: Not needed. Handled by status events.
                                // this.setState(RobotState.CONNECT_ERROR);
                                // this.handleOnConnectError();
                            })
                    })
                    .catch((err: any) => {
                        this.setState(RobotState.GET_ROBOT_ERROR);
                        this.updateRobotStatusMessagesError(err);
                    });
            })
            .catch((err: Error) => {
                this.setState(RobotState.LOGIN_ERROR);
                this.updateRobotStatusMessagesError(err.message);
            })
    }

    get reconnectCooldownDuration(): number {
        return this._reconnectCooldownDuration;
    }

    set reconnectCooldownDuration(value: number) {
        this._reconnectCooldownDuration = value;
    }

    get reconnectCooldownTimeRemaining(): number {
        const cooldownElapsed: number = new Date().getTime() - this._reconnectCooldownStart;
        const cooldownRemaining: number = Math.max(0, this._reconnectCooldownDuration - cooldownElapsed);
        return cooldownRemaining;
    }

    reconnectAfterCooldown(resetCooldown: boolean = false) {
        if (this._reconnectCooldownTimeout) {
            clearTimeout(this._reconnectCooldownTimeout);
            this._reconnectCooldownTimeout = undefined;
        }
        if (resetCooldown) {
            this._reconnectCooldownStart = new Date().getTime();
        }
        if (this.reconnectCooldownTimeRemaining === 0) {
            this.updateRobotStatusMessages('Robot: reconnectAfterCooldown: OK');
            this._connectErrorCount = 0;
            this.tryReconnect();
        } else {
            const time: number = this.reconnectCooldownTimeRemaining + 10;
            this.updateRobotStatusMessages(`Robot: reconnectAfterCooldown: postponed: ${time}ms`);
            this._reconnectCooldownTimeout = setTimeout(this.reconnectAfterCooldown.bind(this), time);
        }
    }

    tryReconnect() {
        if (this._autoReconnect) {
            if (this._connectErrorCount < this._maxConnectErrors) {
                if (this._romApp) {
                    this.connect(this._romApp);
                } else {
                    this.setState(RobotState.FUNKY);
                }
            } else {
                this.setState(RobotState.MAX_CONNECT_ERRORS);
                this.reconnectAfterCooldown(true);
            }
        }
    }

    //// Redundant?: Not needed. Handled by status events.
    // handleOnConnectError() {
    //     this.updateRobotStatusMessages('Robot: handleOnConnectError');
    //     if (this._robotConnection) {
    //         this._robotConnection.removeAllListeners();
    //         this._robotConnection = undefined;
    //     }
    //     this._connected = false;
    //     this._connectErrorCount += 1;
    //     this.setState(RobotState.IDLE);
    //     this.tryReconnect();
    // }

    async loginToAccount(creds: JiboAccountCreds): Promise<JiboAccount> {
        let account: JiboAccount = new JiboAccount(creds);
        this.setState(RobotState.LOGGING_IN);
        this.updateRobotStatusMessages(`Attempting Login...`);
        await account.login();
        return account;
    }

    async getRobot(account: JiboAccount, name: string): Promise<JiboRobotConnection> {
        // Call the account.getRobots API to get a list of all robots associated with the account
        this.setState(RobotState.GETTING_ROBOT);
        const robots = await account.getRobots();
        // Select the robot that matches the desired robot name
        const robot = robots.find(robot => robot.serialName === name);
        // Log an error if the robot can't be found on the account
        if (!robot) {
            this.updateRobotStatusMessages(robots.map(robot => robot.serialName).join('\n'));
            this.updateRobotStatusMessagesError(`Robot: getRobot: ${name} not found`);
            this.setState(RobotState.GET_ROBOT_ERROR);
            throw new Error(`Robot ${name} not found`);
        }
        return robot;
    }

    handleOnDisconnected() {
        this.updateRobotStatusMessages('Robot: handleOnDisconnected');
        this.setState(RobotState.IDLE);
        this.clearKeepAlive();
        this._connected = false;
        this._connectErrorCount += 1;
        if (this._robotConnection) {
            this._robotConnection.removeAllListeners();
            this._robotConnection = undefined;
        }
        this.tryReconnect();
    }

    disconnect(): void {
        this.setState(RobotState.DISCONNECTING);
        this.updateRobotStatusMessages(`Attempting to disconnect...`);
        this.clearKeepAlive();
        try {
            if (this._connected && this._robotConnection) {
                this._robotConnection.removeAllListeners();
                this._robotConnection.disconnect();
                this._robotConnection = undefined;
                this._connected = false;
                this._connectErrorCount = 0; // reset to 0 if normal disconnect
                this.setState(RobotState.IDLE);
            } else {
                this._connectErrorCount = 0; // reset to 0 if normal disconnect
                this.updateRobotStatusMessages(`...not connected.`);
                this.setState(RobotState.IDLE);
            }
        } catch (err) {
            this.setState(RobotState.DISCONNECT_ERROR);
            this.reportError(err);
        }
    }

    get connected(): boolean {
        return this._connected;
    }

    get targeted(): boolean {
        return this._targeted;
    }

    set targeted(value: boolean) {
        this._targeted = value;
    }

    toggleTargeted(): void {
        this._targeted = !this._targeted;
    }

    get requester(): any | undefined {
        let result: any;
        if (this._robotConnection) {
            result = this._robotConnection.requester;
        }
        return result;
    }

    mute(state: boolean = true): void {
        this._muted = state;
        this.updateRobotStatusMessages(`muted: ${this._muted}`);
    }

    status(): RobotStats {
        const keepAlive: boolean = this._keepAliveInterval != undefined;
        const trackingMotion: boolean = this._motionTrackToken != undefined;
        const trackingFaces: boolean = this._faceTrackToken != undefined;

        return {
            name: this.name,
            ip: this.ip,
            type: this.type,
            serialName: this.serialName,
            number: this._number,
            connected: this.connected,
            targeted: this.targeted,
            muted: this._muted,
            state: this.stateName,
            autoReconnect: this._autoReconnect,
            keepAlive: keepAlive,
            connectErrorCount: this._connectErrorCount,
            errorCount: this.errorCount,
            lastError: this.getLastError(),
            trackingMotion: trackingMotion,
            trackingFaces: trackingFaces,
            aliveTime: new Date().getTime() - this._startTime,
        }
    }

}
