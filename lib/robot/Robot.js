"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const RomCommand_1 = require("../rom/RomCommand");
const Hub_1 = require("../rom/Hub");
const Logger_1 = require("../Logger");
const fs = require('fs');
const http = require('http');
const apptoolkit_library_1 = require("@jibo/apptoolkit-library");
var RobotType;
(function (RobotType) {
    RobotType["jibo"] = "jibo";
    RobotType["robokit"] = "robokit";
})(RobotType = exports.RobotType || (exports.RobotType = {}));
var RobotIntentType;
(function (RobotIntentType) {
    RobotIntentType[RobotIntentType["LAUNCH"] = 0] = "LAUNCH";
    RobotIntentType[RobotIntentType["LISTEN"] = 1] = "LISTEN";
    RobotIntentType[RobotIntentType["ACTION_COMPLETE"] = 2] = "ACTION_COMPLETE";
})(RobotIntentType = exports.RobotIntentType || (exports.RobotIntentType = {}));
var RobotState;
(function (RobotState) {
    RobotState[RobotState["INIT"] = 0] = "INIT";
    RobotState[RobotState["IDLE"] = 1] = "IDLE";
    RobotState[RobotState["LOGGING_IN"] = 2] = "LOGGING_IN";
    RobotState[RobotState["LOGGED_IN"] = 3] = "LOGGED_IN";
    RobotState[RobotState["LOGIN_ERROR"] = 4] = "LOGIN_ERROR";
    RobotState[RobotState["GETTING_ROBOT"] = 5] = "GETTING_ROBOT";
    RobotState[RobotState["GOT_ROBOT"] = 6] = "GOT_ROBOT";
    RobotState[RobotState["GET_ROBOT_ERROR"] = 7] = "GET_ROBOT_ERROR";
    RobotState[RobotState["REQUESTING_CERTIFICATE"] = 8] = "REQUESTING_CERTIFICATE";
    RobotState[RobotState["RECEIVED_CERTIFICATE"] = 9] = "RECEIVED_CERTIFICATE";
    RobotState[RobotState["CERTIFICATE_ERROR"] = 10] = "CERTIFICATE_ERROR";
    RobotState[RobotState["CONNECTING"] = 11] = "CONNECTING";
    RobotState[RobotState["CONNECTED"] = 12] = "CONNECTED";
    RobotState[RobotState["CONNECT_ERROR"] = 13] = "CONNECT_ERROR";
    RobotState[RobotState["DISCONNECTING"] = 14] = "DISCONNECTING";
    // DISCONNECTED,
    RobotState[RobotState["DISCONNECT_ERROR"] = 15] = "DISCONNECT_ERROR";
    RobotState[RobotState["MAX_CONNECT_ERRORS"] = 16] = "MAX_CONNECT_ERRORS";
    RobotState[RobotState["FUNKY"] = 17] = "FUNKY";
})(RobotState = exports.RobotState || (exports.RobotState = {}));
class Robot extends events_1.EventEmitter {
    constructor(options) {
        super();
        this._keepAliveFrequency = 60000;
        this._type = 'jibo';
        this.name = '';
        this.ip = '';
        this.serialName = '';
        this.email = '';
        this.password = '';
        this._number = 0;
        this._muted = false;
        this._connectErrorCount = 0;
        this._maxConnectErrors = 3;
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
        };
        this.initWithData(options);
        this._connected = false;
        this._autoReconnect = false;
        this._targeted = false;
        this._hub = new Hub_1.default(this);
        this._stateData = { userId: '', userName: '' };
        this._state = RobotState.INIT;
        this.setState(RobotState.IDLE);
        this._errors = [];
    }
    get romApp() {
        return this._romApp;
    }
    set romApp(value) {
        this._romApp = value;
    }
    get type() {
        return this._type;
    }
    set type(typeString) {
        this._type = typeString;
    }
    get autoReconnect() {
        return this._autoReconnect;
    }
    set autoReconnect(value) {
        this._autoReconnect = value;
    }
    get keepAliveFrequency() {
        return this._keepAliveFrequency;
    }
    set keepAliveFrequency(value) {
        this._keepAliveFrequency = value;
        this.resetKeepAlive();
    }
    get errors() {
        return this._errors;
    }
    get maxConnectErrors() {
        return this._maxConnectErrors;
    }
    set maxConnectErrors(value) {
        this._maxConnectErrors = value;
        this._connectErrorCount = 0;
    }
    reportError(error, state) {
        const errorState = state || this._state;
        const errorStateKey = RobotState[errorState];
        const robotError = {
            state: errorStateKey,
            error: error,
            timestamp: new Date().getTime(),
        };
        this._errors.unshift(robotError);
    }
    get errorCount() {
        return this._errors.length;
    }
    getLastError(count = 1) {
        let result = this._errors[0];
        if (count > 1) {
            result = this._errors.slice(0, count);
        }
        return result;
    }
    clearErrors() {
        this._errors = [];
    }
    setState(state) {
        if (state != this._state) {
            // transition
            const oldState = RobotState[this._state];
            const newState = RobotState[state];
            this.updateRobotStatusMessages(`${oldState} -> ${newState}`);
        }
        this._state = state;
    }
    get state() {
        return this._state;
    }
    get stateName() {
        return RobotState[this._state];
    }
    get hub() {
        return this._hub;
    }
    initWithData(data) {
        this.type = data.type || 'jibo';
        this.name = data.name;
        this.ip = data.ip;
        this.serialName = data.serialName;
        this.email = data.email;
        this.password = data.password;
    }
    updateRobotStatusMessagesWithType(type, message, subsystem = '', clearMessages = false) {
        const robotName = this.name;
        let subsystemString = subsystem ? `<${subsystem}> ` : '';
        let statusMessage = '';
        if (typeof message === 'string') {
            statusMessage = `${subsystemString}${message}`;
        }
        else {
            try {
                statusMessage = `${subsystemString} ${JSON.stringify(message, null, 2)}`;
            }
            catch (error) {
                statusMessage = `${error}`;
            }
        }
        if (type === 'info') {
            Logger_1.default.info([statusMessage], robotName);
        }
        else {
            Logger_1.default.error([statusMessage], robotName);
        }
        this.emit('statusMessage', { message: statusMessage, subsystem: subsystem, type: type });
    }
    updateRobotStatusMessages(message, subsystem = '', clearMessages = false) {
        this.updateRobotStatusMessagesWithType('info', message, subsystem, clearMessages);
    }
    updateRobotStatusMessagesError(message, subsystem = '', clearMessages = false) {
        this.updateRobotStatusMessagesWithType('error', message, subsystem, clearMessages);
    }
    get number() {
        return this._number;
    }
    set number(number) {
        this._number = number;
    }
    get json() {
        let json = {
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
    updateUserData(userId, userName) {
        this._stateData.userId = userId;
        this._stateData.userName = userName;
    }
    get userData() {
        return { userId: this._stateData.userId, userName: this._stateData.userName };
    }
    updateStateData(data) {
        this._stateData = Object.assign(this._stateData, data);
    }
    // session Conext Data
    get stateData() {
        return this._stateData;
    }
    // session Conext Data
    set stateData(data) {
        this._stateData = data;
    }
    onLaunchIntent(robotIntentData) {
        let robotIntent = { robot: this, type: RobotIntentType.LAUNCH, data: robotIntentData };
        this.emit('robotIntent', robotIntent);
    }
    onListenIntent(robotIntentData) {
        let robotIntent = { robot: this, type: RobotIntentType.LISTEN, data: robotIntentData };
        this.emit('robotIntent', robotIntent);
    }
    sendCommand(command) {
        this.resetKeepAlive();
        if (this._robotConnection) {
            try {
                switch (command.type) {
                    case "say":
                    case "tts":
                        if (!this._muted && command.data && (command.data.text || command.data.prompt)) {
                            let prompt = command.data.text || command.data.prompt;
                            let p = this._robotConnection.requester.expression.say(prompt).complete;
                            p.then(() => {
                                // console.log(`Robot: sendCommand: done`);
                                let robotIntentData = { nluType: 'none', asr: '', intent: 'OK', launchId: undefined, nluData: undefined, userId: undefined };
                                let robotIntent = { robot: this, type: RobotIntentType.ACTION_COMPLETE, data: robotIntentData };
                                this.emit('robotIntent', robotIntent);
                            })
                                .catch((result) => {
                                this.updateRobotStatusMessagesError(result);
                            });
                        }
                        break;
                    case "ask":
                        if (!this._muted && command.data && command.data.prompt) {
                            let prompt = command.data.prompt;
                            let contexts = command.data.contexts || [];
                            let nluDefault = 'none';
                            if (this._romApp && this._romApp.nluDefault) {
                                nluDefault = this._romApp.nluDefault;
                            }
                            let nluType = command.data.nluType || nluDefault;
                            let p = this._robotConnection.requester.expression.say(prompt).complete;
                            p.then(() => {
                                if (this._robotConnection) {
                                    let listenToken = this._robotConnection.requester.listen.start();
                                    listenToken.update.on((listenResultEvent) => {
                                        this.updateRobotStatusMessages(`Robot: ask: Heard: ${listenResultEvent ? listenResultEvent.Speech : ''}`);
                                        if (listenResultEvent && listenResultEvent.Event == 'onListenResult' && listenResultEvent.Speech) {
                                            let robotIntentData = { nluType: nluType, asr: listenResultEvent.Speech, intent: '', launchId: undefined, nluData: undefined, userId: undefined };
                                            if (nluType != 'none') {
                                                this._hub.getIntent(listenResultEvent.Speech, contexts, nluType)
                                                    .then((nluData) => {
                                                    robotIntentData.intent = nluData.intent;
                                                    robotIntentData.nluData = nluData;
                                                    this.onListenIntent(robotIntentData);
                                                })
                                                    .catch((err) => {
                                                    this.updateRobotStatusMessages('Robot: ask: getIntent: error:');
                                                    this.updateRobotStatusMessages(err);
                                                });
                                            }
                                            else {
                                                this.onListenIntent(robotIntentData);
                                            }
                                        }
                                        else {
                                            this.updateRobotStatusMessagesError('Error: invalid listen result: ask');
                                        }
                                    });
                                }
                                else {
                                    this.updateRobotStatusMessagesError('Error starting listen for command: ask');
                                }
                            })
                                .catch((result) => {
                                this.updateRobotStatusMessagesError(result);
                            });
                        }
                        break;
                    case "lookAtPosition":
                    case "lookAt":
                        if (!this._muted && command.data && (command.data.angle || command.data.vector)) {
                            let p;
                            if (command.data.angle) {
                                let angleVector = { theta: command.data.angle, psi: 0 };
                                let lookAtTarget = { type: "ANGLE", angle: angleVector, levelHead: true };
                                p = this._robotConnection.requester.expression.look(lookAtTarget).complete;
                            }
                            else if (command.data.vector) {
                                let vector = { x: command.data.vector[0], y: command.data.vector[1], z: command.data.vector[2] };
                                let position = { type: "POSITION", position: vector, levelHead: true };
                                p = this._robotConnection.requester.expression.look(position).complete;
                            }
                            if (p) {
                                p.then(() => {
                                    // console.log(`Robot: sendCommand: done`);
                                })
                                    .catch((result) => {
                                    this.updateRobotStatusMessagesError(result);
                                });
                            }
                        }
                        break;
                    case "attention":
                        if (!this._muted && command.data && command.data.state) {
                            let mode = 'OFF';
                            switch (command.data.state) {
                                case "OFF":
                                    mode = 'OFF';
                                    break;
                                case "IDLE":
                                    mode = 'IDLE';
                            }
                            let p = this._robotConnection.requester.expression.setAttention(mode).complete;
                            p.then(() => {
                                // console.log(`Robot: sendCommand: done`);
                            })
                                .catch((result) => {
                                this.updateRobotStatusMessagesError(result);
                            });
                        }
                        break;
                    case "volume":
                        if (!this._muted && command.data && command.data.volume) {
                            let configOptions = {
                                mixer: Number(command.data.volume)
                            };
                            let p = this._robotConnection.requester.config.set(configOptions).complete;
                            p.then(() => {
                                // console.log(`Robot: sendCommand: done`);
                            })
                                .catch((result) => {
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
                            let data = {
                                Type: "Image",
                                Name: command.data.name,
                                Image: {
                                    name: command.data.name,
                                    src: command.data.url
                                }
                            };
                            let p = this._robotConnection.requester.display.swap(data).complete;
                            p.then(() => {
                                // console.log(`Robot: sendCommand: done`);
                            })
                                .catch((result) => {
                                this.updateRobotStatusMessagesError(result);
                            });
                        }
                        break;
                    case "eye":
                        if (!this._muted) {
                            let data = {
                                Type: "Eye",
                                Name: "eye"
                            };
                            let p = this._robotConnection.requester.display.swap(data).complete;
                            p.then(() => {
                                // console.log(`Robot: sendCommand: done`);
                            })
                                .catch((result) => {
                                this.updateRobotStatusMessagesError(result);
                            });
                        }
                        break;
                    case "motion":
                        if (!this._muted && command.data && command.data.state) {
                            if (command.data.state == 'ON') {
                                if (!this._motionTrackToken) {
                                    this._motionTrackToken = this._robotConnection.requester.perception.subscribe.motion(); //this._requester.motionTrack.trackMotions();
                                    this._motionTrackToken.update.on((detectedMotions) => {
                                        // TODO:
                                    });
                                }
                            }
                            else if (command.data.state == 'OFF') {
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
                                this._faceTrackToken = this._robotConnection.requester.perception.subscribe.face(); //this._requester.faceTrack.trackFaces();
                                this._faceTrackToken.gained.on((detectedEntities) => {
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
                                this._faceTrackToken.update.on((updatedEntities) => {
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
                            }
                            else if (command.data.state == 'OFF') {
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
                            let p = this._robotConnection.requester.media.capture.photo().complete; //photo.takePhoto().complete;
                            p.then((data) => {
                                const uri = data.URI;
                                // console.log(data);
                                this.updateRobotStatusMessages(`Robot: photo: photo ready - uri: ${uri}`);
                                //start getting the thing
                                const file = fs.createWriteStream('./PhotoIzHere.jpg');
                                http.get({
                                    hostname: this.ip,
                                    port: 8160,
                                    path: uri
                                }, (response) => {
                                    response.pipe(file);
                                    this.updateRobotStatusMessages('Robot: photo: Your photo was saved as PhotoIzHere.jpg');
                                    // var cp = require("child_process");
                                    // cp.exec("open PhotoIzHere.jpg");
                                });
                            })
                                .catch((result) => {
                                this.updateRobotStatusMessagesError(result);
                            });
                        }
                        catch (err) {
                            this.updateRobotStatusMessagesError(err);
                        }
                        break;
                }
            }
            catch (err) {
                this.updateRobotStatusMessagesError(`Robot: sendCommand: try: error:`);
                this.updateRobotStatusMessagesError(err);
            }
        }
    }
    keepAlive() {
        this.updateRobotStatusMessages(`keepAlive`);
        let command = new RomCommand_1.default("", "say", { text: '.' });
        this.sendCommand(command);
    }
    clearKeepAlive() {
        if (this._keepAliveInterval) {
            clearInterval(this._keepAliveInterval);
            this._keepAliveInterval = undefined;
        }
    }
    resetKeepAlive() {
        this.clearKeepAlive();
        this._keepAliveInterval = setInterval(this.keepAlive.bind(this), this._keepAliveFrequency);
    }
    connect(romApp) {
        Logger_1.default.info(['\n\n            ************ CONNECTING ************\n\n'], this.name);
        this._romApp = romApp;
        if (this._connected) {
            this.disconnect();
        }
        let creds = {
            clientId: this._romApp.clientId,
            clientSecret: this._romApp.clientSecret,
            email: this.email,
            password: this.password,
        };
        this.loginToAccount(creds)
            .then((account) => {
            this.updateRobotStatusMessages(`logged in`);
            this.setState(RobotState.LOGGED_IN);
            this.getRobot(account, this.serialName)
                .then((connection) => {
                this.setState(RobotState.GOT_ROBOT);
                this._robotConnection = connection;
                this._robotConnection.on('status', (status) => {
                    this.updateRobotStatusMessages(`connection: status: ${status}`);
                    if (status === 'certificateRequested') {
                        this.setState(RobotState.REQUESTING_CERTIFICATE);
                    }
                    else if (status === 'certificateReceived') {
                        this.setState(RobotState.RECEIVED_CERTIFICATE);
                    }
                    else if (status === 'disconnected') {
                        this.handleOnDisconnected();
                    }
                });
                this.setState(RobotState.CONNECTING);
                this._robotConnection.connect()
                    .then(() => {
                    if (this._robotConnection) {
                        this.updateRobotStatusMessages(`Robot: connected!`);
                        this.setState(RobotState.CONNECTED);
                        Logger_1.default.info(['\n\n            ************ CONNECTED ************\n\n'], this.name);
                        const connectionObj = this._robotConnection;
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
                    }
                    else {
                        this.updateRobotStatusMessagesError(`Robot: this._robotConnection.connect(): then: error: _robotConnection undefined.`);
                        // Redundant?: Not needed. Handled by status events.
                        // this.setState(RobotState.CONNECT_ERROR);
                        // this.handleOnConnectError();
                    }
                })
                    .catch((err) => {
                    this.updateRobotStatusMessagesError('Robot: this._robotConnection.connect(): catch:');
                    this.updateRobotStatusMessagesError(err.message);
                    if (err && err.message === 'Failed to retrieve certificate') {
                        this.setState(RobotState.CONNECT_ERROR);
                        this.handleOnConnectError();
                    }
                });
            })
                .catch((err) => {
                this.setState(RobotState.GET_ROBOT_ERROR);
                this.updateRobotStatusMessagesError(err);
            });
        })
            .catch((err) => {
            this.setState(RobotState.LOGIN_ERROR);
            this.updateRobotStatusMessagesError(err.message);
        });
    }
    get reconnectCooldownDuration() {
        return this._reconnectCooldownDuration;
    }
    set reconnectCooldownDuration(value) {
        this._reconnectCooldownDuration = value;
    }
    get reconnectCooldownTimeRemaining() {
        const cooldownElapsed = new Date().getTime() - this._reconnectCooldownStart;
        const cooldownRemaining = Math.max(0, this._reconnectCooldownDuration - cooldownElapsed);
        return cooldownRemaining;
    }
    reconnectAfterCooldown(resetCooldown = false) {
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
        }
        else {
            const time = this.reconnectCooldownTimeRemaining + 10;
            this.updateRobotStatusMessages(`Robot: reconnectAfterCooldown: postponed: ${time}ms`);
            this._reconnectCooldownTimeout = setTimeout(this.reconnectAfterCooldown.bind(this), time);
        }
    }
    tryReconnect() {
        if (this._autoReconnect) {
            if (this._connectErrorCount < this._maxConnectErrors) {
                if (this._romApp) {
                    this.connect(this._romApp);
                }
                else {
                    this.setState(RobotState.FUNKY);
                }
            }
            else {
                this.setState(RobotState.MAX_CONNECT_ERRORS);
                this.reconnectAfterCooldown(true);
            }
        }
    }
    handleOnConnectError() {
        this.updateRobotStatusMessages('Robot: handleOnConnectError');
        if (this._robotConnection) {
            this._robotConnection.removeAllListeners();
            this._robotConnection = undefined;
        }
        this._connected = false;
        this._connectErrorCount += 1;
        this.setState(RobotState.IDLE);
        this.tryReconnect();
    }
    loginToAccount(creds) {
        return __awaiter(this, void 0, void 0, function* () {
            let account = new apptoolkit_library_1.Account(creds);
            this.setState(RobotState.LOGGING_IN);
            this.updateRobotStatusMessages(`Attempting Login...`);
            yield account.login();
            return account;
        });
    }
    getRobot(account, name) {
        return __awaiter(this, void 0, void 0, function* () {
            // Call the account.getRobots API to get a list of all robots associated with the account
            this.setState(RobotState.GETTING_ROBOT);
            const robots = yield account.getRobots();
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
        });
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
    disconnect() {
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
            }
            else {
                this._connectErrorCount = 0; // reset to 0 if normal disconnect
                this.updateRobotStatusMessages(`...not connected.`);
                this.setState(RobotState.IDLE);
            }
        }
        catch (err) {
            this.setState(RobotState.DISCONNECT_ERROR);
            this.reportError(err);
        }
    }
    get connected() {
        return this._connected;
    }
    get targeted() {
        return this._targeted;
    }
    set targeted(value) {
        this._targeted = value;
    }
    toggleTargeted() {
        this._targeted = !this._targeted;
    }
    get requester() {
        let result;
        if (this._robotConnection) {
            result = this._robotConnection.requester;
        }
        return result;
    }
    mute(state = true) {
        this._muted = state;
        this.updateRobotStatusMessages(`muted: ${this._muted}`);
    }
    status() {
        const keepAlive = this._keepAliveInterval != undefined;
        const trackingMotion = this._motionTrackToken != undefined;
        const trackingFaces = this._faceTrackToken != undefined;
        const hubStats = this.hub ? this.hub.status() : {};
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
            hubStats: hubStats
        };
    }
}
exports.default = Robot;
//# sourceMappingURL=Robot.js.map