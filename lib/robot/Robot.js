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
class Robot extends events_1.EventEmitter {
    constructor(options) {
        super();
        this._type = 'jibo';
        this.name = '';
        this.ip = '';
        this.serialName = '';
        this.email = '';
        this.password = '';
        this._number = 0;
        this._muted = false;
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
        this._targeted = false;
        this._hub = new Hub_1.default(this);
        this._stateData = { userId: '', userName: '' };
    }
    get type() {
        return this._type;
    }
    set type(typeString) {
        this._type = typeString;
    }
    initWithData(data) {
        this.type = data.type || 'jibo';
        this.name = data.name;
        this.ip = data.ip;
        this.serialName = data.serialName;
        this.email = data.email;
        this.password = data.password;
    }
    updateRobotStatusMessages(message, subsystem, clearMessages = false) {
        subsystem = subsystem || `Robot<${this.name}>`;
        // if (clearMessages) {
        //     this.statusMessages = '';
        // } else {
        //     if (this.statusMessages) {
        //         this.statusMessages = `${this.statusMessages}\n${subsystem}: ${message}`;
        //     } else {
        //         this.statusMessages = `${subsystem}: ${message}`;
        //     }
        // }
        this.emit('statusMessage', { message: message, subsystem: subsystem });
        return '';
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
    get stateData() {
        return this._stateData;
    }
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
                            console.log(result);
                            this.updateRobotStatusMessages(JSON.stringify(result, null, 2));
                        });
                    }
                    break;
                case "ask":
                    if (!this._muted && command.data && command.data.prompt) {
                        let prompt = command.data.prompt;
                        let contexts = command.data.contexts || [];
                        let nluDefault = 'none';
                        if (this.romApp && this.romApp.nluDefault) {
                            nluDefault = this.romApp.nluDefault;
                        }
                        let nluType = command.data.nluType || nluDefault;
                        let p = this._robotConnection.requester.expression.say(prompt).complete;
                        p.then(() => {
                            if (this._robotConnection) {
                                let listenToken = this._robotConnection.requester.listen.start();
                                listenToken.update.on((listenResultEvent) => {
                                    console.log("Hey! I think i heard something: ", listenResultEvent);
                                    // {Event: "onListenResult", LanguageCode: "en-US", Speech: "I'd like to order a pepperoni pizza"}
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
                                                console.log(err);
                                            });
                                        }
                                        else {
                                            this.onListenIntent(robotIntentData);
                                        }
                                    }
                                    else {
                                        this.updateRobotStatusMessages(`Error: invalid listen result: ask`);
                                    }
                                });
                            }
                            else {
                                this.updateRobotStatusMessages(`Error starting listen for command: ask`);
                            }
                        })
                            .catch((result) => {
                            console.log(result);
                            this.updateRobotStatusMessages(JSON.stringify(result, null, 2));
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
                            console.log(`p:`, p);
                            p.then(() => {
                                // console.log(`Robot: sendCommand: done`);
                            })
                                .catch((result) => {
                                console.log(result);
                                this.updateRobotStatusMessages(JSON.stringify(result, null, 2));
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
                            console.log(result);
                            this.updateRobotStatusMessages(JSON.stringify(result, null, 2));
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
                            console.log(result);
                            this.updateRobotStatusMessages(JSON.stringify(result, null, 2));
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
                            console.log(result);
                            this.updateRobotStatusMessages(JSON.stringify(result, null, 2));
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
                            console.log(result);
                            this.updateRobotStatusMessages(JSON.stringify(result, null, 2));
                        });
                    }
                    break;
                case "motion":
                    if (!this._muted && command.data && command.data.state) {
                        if (command.data.state == 'ON') {
                            if (!this._motionTrackToken) {
                                this._motionTrackToken = this._robotConnection.requester.perception.subscribe.motion(); //this._requester.motionTrack.trackMotions();
                                this._motionTrackToken.update.on((detectedMotions) => {
                                    console.log(detectedMotions);
                                    console.log(`detectedMotion: update: count: ${detectedMotions.length}:`, detectedMotions);
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
                        if (command.data.state == 'ON') {
                            this._faceTrackToken = this._robotConnection.requester.perception.subscribe.face(); //this._requester.faceTrack.trackFaces();
                            this._faceTrackToken.gained.on((detectedEntities) => {
                                if (detectedEntities.length > 0) {
                                    var id = detectedEntities[0].EntityID;
                                    console.log(`detectedFaces: gained: count: ${detectedEntities.length}, id: ${id}`, detectedEntities);
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
                                    var id = updatedEntities[0].EntityID;
                                    console.log(`detectedFaces: update: count: ${updatedEntities.length}, id: ${id}`, updatedEntities);
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
                    console.log(this._robotConnection.requester);
                    console.log(this._robotConnection.requester.media.capture);
                    console.log(this._robotConnection.requester.media.capture.photoRequest);
                    try {
                        let p = this._robotConnection.requester.media.capture.photo().complete; //photo.takePhoto().complete;
                        p.then((data) => {
                            const uri = data.URI;
                            console.log(data);
                            console.log('photo ready - uri: ', uri);
                            //start getting the thing
                            const file = fs.createWriteStream('./PhotoIzHere.jpg');
                            http.get({
                                hostname: this.ip,
                                port: 8160,
                                path: uri
                            }, function (response) {
                                response.pipe(file);
                                console.log('Your photo was saved as PhotoIzHere.jpg');
                                var cp = require("child_process");
                                cp.exec("open PhotoIzHere.jpg");
                            });
                        })
                            .catch((result) => {
                            console.log(result);
                            this.updateRobotStatusMessages(JSON.stringify(result, null, 2));
                        });
                    }
                    catch (err) {
                        console.log(err);
                    }
                    break;
            }
        }
    }
    keepAlive() {
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
        this._keepAliveInterval = setInterval(this.keepAlive.bind(this), 60000);
    }
    connect(romApp) {
        console.log(`connect:`, romApp);
        this.romApp = romApp;
        this.updateRobotStatusMessages(`Attempting to connect...`);
        if (this._connected) {
            this.disconnect();
        }
        let creds = {
            clientId: romApp.clientId,
            clientSecret: romApp.clientSecret,
            email: this.email,
            password: this.password,
        };
        this.loginToAccount(creds)
            .then((account) => {
            console.log(`connect: connected:`, account);
            // let obj: any = account;
            // console.log(obj, obj.constants);
            this.getRobot(account, this.serialName)
                .then((connection) => {
                console.log(`connection:`, connection);
                this._robotConnection = connection;
                this._robotConnection.on('status', (status) => {
                    console.info(`connection: status: ${status}`);
                    this.updateRobotStatusMessages(status);
                });
                this._robotConnection.connect()
                    .then(() => {
                    console.log(`connect: Robot connected!`);
                    if (this._robotConnection) {
                        const connectionObj = this._robotConnection;
                        this.ip = connectionObj['_ip'];
                        this._robotConnection.once('disconnect', () => {
                            console.info('connect: Robot disconnected.');
                            this.updateRobotStatusMessages('connect: Robot disconnected.');
                            this._connected = false;
                        });
                        this._connected = true;
                        this._targeted = true;
                        this._hub.onRobotConnected();
                        this.emit('updateRobot', this);
                        this.resetKeepAlive();
                    }
                    else {
                        console.log(`connect: error: _robotConnection undefined.`);
                        this._connected = false;
                        this.updateRobotStatusMessages(`connect: error: _robotConnection undefined.`);
                    }
                })
                    .catch((err) => {
                    console.log(`connect: connection.connect: error:`, err);
                    this.updateRobotStatusMessages(`connect: connection.connect: error: ${err}`);
                });
            })
                .catch((err) => {
                console.log(`connect: getRobot: error:`, err);
            });
        })
            .catch((err) => {
            console.log(`connect: loginToAccount: error:`, err);
        });
    }
    loginToAccount(creds) {
        return __awaiter(this, void 0, void 0, function* () {
            let account = new apptoolkit_library_1.Account(creds);
            console.log(`jiboConnect: Logging in... `);
            // Call the account.login function
            yield account.login();
            console.info('done');
            return account;
        });
    }
    getRobot(account, name) {
        return __awaiter(this, void 0, void 0, function* () {
            process.stdout.write('Getting robot info... ');
            // Call the account.getRobots API to get a list of all robots associated with the account
            const robots = yield account.getRobots();
            console.info('done');
            // Select the robot that matches the desired robot name
            const robot = robots.find(robot => robot.serialName === name);
            // Log an error if the robot can't be found on the account
            if (!robot) {
                console.info('Robots on account:');
                console.info(robots.map(robot => robot.serialName).join('\n'));
                throw new Error(`Robot ${name} not found`);
            }
            return robot;
        });
    }
    disconnect() {
        this.updateRobotStatusMessages(`Attempting to disconnect...`);
        try {
            if (this._connected && this._robotConnection) {
                this._robotConnection.disconnect();
                this._robotConnection = undefined;
            }
        }
        catch (err) {
            console.log(`Robot: disconnect: error:`, err);
        }
        this._connected = false;
        this.clearKeepAlive();
    }
    get connected() {
        return this._connected;
    }
    get targeted() {
        return this._targeted;
    }
    get requester() {
        let result;
        if (this._robotConnection) {
            result = this._robotConnection.requester;
        }
        return result;
    }
    toggleTargeted() {
        this._targeted = !this._targeted;
    }
    mute(state = true) {
        this._muted = state;
        console.log(`muted: `, this._muted);
    }
}
exports.default = Robot;
//# sourceMappingURL=Robot.js.map