import Neo4jController, { GraphConnection } from '../graph/neo4j/Neo4jController';
import IRomApp from './IRomApp';
import Robot from '../robot/Robot';
import { Joke } from './JokeSkill';
export default class PersistenceManager {
    private static _instance;
    romApp: IRomApp | undefined;
    neo4jController: Neo4jController | undefined;
    graphConnection: GraphConnection | undefined;
    private constructor();
    static get Instance(): PersistenceManager;
    connect(romApp: IRomApp, force?: boolean): void;
    persistLaunchIntent(robotId: string, userId: string, intent: string, launchId: string): void;
    getActivity(robotId: string): Promise<string[]>;
    persistJoke(robot: Robot, joke: Joke, launchId: string): void;
    persistUserLikesThing(robot: Robot, thing: string, launchId: string, userId: string): void;
}
