import EnsembleSkill from './EnsembleSkill';
import { RobotIntentData } from '../robot/Robot';
export default class ClockEnsembleSkill extends EnsembleSkill {
    constructor(id: string, launchIntent: string);
    launch(data: RobotIntentData): void;
    tick(frameTime: number, elapsedTime: number): void;
}
