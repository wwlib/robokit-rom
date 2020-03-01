/// <reference types="node" />
import { EventEmitter } from 'events';
export default class AsyncToken<T> extends EventEmitter {
    complete: Promise<T> | undefined;
    update: any;
    constructor();
}
