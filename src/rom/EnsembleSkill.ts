import Hub from './Hub';
import Skill from './Skill';
import Robot from '../robot/Robot';

export default abstract class EnsembleSkill extends Skill {

    public hubMap: Map<string, Hub>;

    protected constructor(id: string, launchIntent: string) {
        super (undefined, id, launchIntent);
        this.hubMap = new Map<string, Hub>();
    }

    get hubs(): Hub[] {
        return Array.from(this.hubMap.values());
    }

    addHub(hub: Hub): void {
        this.hubMap.set(hub.robotSerialName, hub);
    }

    getShuffledArrayOfHubs(): any[] {
        return this.shuffleInPlace(Array.from( this.hubMap.values()));
    }

    shuffleInPlace<T>(array: T[]): T[] {
        if (array.length <= 1) return array;
        for (let i = 0; i < array.length; i++) {
            const randomChoiceIndex = this.getRandomInt(i, array.length - 1);
            [array[i], array[randomChoiceIndex]] = [array[randomChoiceIndex], array[i]];
        }

        return array;
    }

    getRandomInt(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    }

    status(): any {
        const hubs: Hub[] = Array.from( this.hubMap.values());
        const robots: string[] = []; 
        hubs.forEach((hub: Hub) => {
            const robot: Robot = hub.robot
            if (robot) {
                robots.push(robot.name);
            }
        });

        return {
            type: 'ensembleSkill',
            id: this.id,
            launchIntent: this.launchIntent,
            running: this.running,
            robots: robots,
        }
    }

}
