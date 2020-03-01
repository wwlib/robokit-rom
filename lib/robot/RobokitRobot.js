"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Robot_1 = require("./Robot");
const RobokitConnection_1 = require("./RobokitConnection");
class RobokitRobot extends Robot_1.default {
    constructor(options) {
        options = options || {
            type: Robot_1.RobotType.robokit,
            name: '',
            ip: '',
            serialName: '',
            email: '',
            password: '',
        };
        options.type = Robot_1.RobotType.robokit;
        super(options);
    }
    sendCommand(command) {
        console.log(`sendCommand:`, command, this._robotConnection);
        if (this._robotConnection) {
            switch (command.type) {
                case "say":
                case "tts":
                    let prompt = command.data.text || command.data.prompt;
                    let p = this._robotConnection.requester.expression.say(prompt).complete;
                    console.log(`p:`, p);
                    p.then(() => {
                        console.log(`Robot: tts: sendCommand: done`);
                        let robotIntentData = { nluType: 'none', asr: '', intent: 'OK', launchId: undefined, nluData: undefined, userId: undefined };
                        let robotIntent = { robot: this, type: Robot_1.RobotIntentType.ACTION_COMPLETE, data: robotIntentData };
                        this.emit('robotIntent', robotIntent);
                    })
                        .catch((result) => {
                        console.log(result);
                        this.updateRobotStatusMessages(JSON.stringify(result, null, 2));
                    });
                    break;
                case "blink":
                    this._robotConnection.requester.expression.blink();
                    break;
                case "lookAt":
                    this._robotConnection.requester.expression.lookAt(command.data);
                    break;
                case "ident":
                    this._robotConnection.requester.expression.ident(command.data);
                    break;
            }
        }
    }
    connect(romApp) {
        console.log(`RobokitRobot: connect:`, romApp);
        this.romApp = romApp;
        this.updateRobotStatusMessages(`Attempting to connect...`);
        if (this._connected) {
            this.disconnect();
        }
        let port = romApp.port || 8080;
        this._robotConnection = new RobokitConnection_1.default(this.ip, port);
        this._robotConnection.connect();
        this._robotConnection.on('connected', () => {
            console.log(`RobokitRobot: connection: connected`);
            this.updateRobotStatusMessages(`...connected.`);
            this._connected = true;
            this._targeted = true;
            this._hub.onRobotConnected();
            this.emit('updateRobot', this);
        });
        // this._robotConnection.on('message', (message: any) => {
        // });
        this._robotConnection.on('error', (error) => {
            console.log(error);
        });
        this._robotConnection.on('closed', () => {
            this.updateRobotStatusMessages(`...connected.`);
            this._connected = false;
            this._targeted = false;
            this.emit('updateRobot', this);
        });
    }
    keepAlive() {
        console.log(`keepAlive:`);
    }
}
exports.default = RobokitRobot;
//# sourceMappingURL=RobokitRobot.js.map