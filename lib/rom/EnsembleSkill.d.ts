import Hub from './Hub';
import Skill from './Skill';
export default abstract class EnsembleSkill extends Skill {
    hubMap: Map<string, Hub>;
    protected constructor(id: string, launchIntent: string);
    get hubs(): Hub[];
    addHub(hub: Hub): void;
    getShuffledArrayOfHubs(): any[];
    shuffleInPlace<T>(array: T[]): T[];
    getRandomInt(min: number, max: number): number;
    status(): any;
}
