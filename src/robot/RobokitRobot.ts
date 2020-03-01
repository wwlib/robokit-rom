import Robot, { RobotType, RobotIntentData, RobotIntent, RobotIntentType } from './Robot';
import IRomApp from '../rom/IRomApp';
import RomCommand from '../rom/RomCommand';
import RobokitConnection from './RobokitConnection';

export default class RobokitRobot extends Robot {

    constructor(options?: any) {
        options = options || {
            type: RobotType.robokit,
            name: '',
            ip: '',
            serialName: '',
            email: '',
            password: '',
        }
        options.type = RobotType.robokit
        super(options);
    }

    sendCommand(command: RomCommand): void {
        console.log(`sendCommand:`, command, this._robotConnection);
        if (this._robotConnection) {
            switch (command.type) {
                case "say":
                case "tts":
                    let prompt: string = command.data.text || command.data.prompt;
                    let p = this._robotConnection.requester.expression.say(prompt).complete;
                        console.log(`p:`, p);
                        p.then( () => {
                            console.log(`Robot: tts: sendCommand: done`);
                            let robotIntentData: RobotIntentData = {nluType: 'none', asr: '', intent: 'OK', launchId: undefined, nluData: undefined, userId: undefined};
                            let robotIntent: RobotIntent = {robot: this, type: RobotIntentType.ACTION_COMPLETE, data: robotIntentData};
                            this.emit('robotIntent', robotIntent);
                        })
                        .catch((result: any) => {
                            console.log(result);
                            this.updateRobotStatusMessages(JSON.stringify(result, null, 2))
                        })
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

    connect(romApp: IRomApp): void {
        console.log(`RobokitRobot: connect:`, romApp);
        this.romApp = romApp;
        this.updateRobotStatusMessages(`Attempting to connect...`);
        if (this._connected) {
            this.disconnect();
        }
        let port: number = romApp.port || 8080;
        this._robotConnection = new RobokitConnection(this.ip, port);
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

        this._robotConnection.on('error', (error: any) => {
            console.log(error);
        });

        this._robotConnection.on('closed', () => {
            this.updateRobotStatusMessages(`...connected.`);
            this._connected = false;
            this._targeted = false;
            this.emit('updateRobot', this);
        });

    }

    keepAlive(): void {
        console.log(`keepAlive:`);
    }
}