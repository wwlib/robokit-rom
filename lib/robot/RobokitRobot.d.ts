import Robot from './Robot';
import IRomApp from '../rom/IRomApp';
import RomCommand from '../rom/RomCommand';
export default class RobokitRobot extends Robot {
    constructor(options?: any);
    sendCommand(command: RomCommand): void;
    connect(romApp: IRomApp): void;
    keepAlive(): void;
}
