import { EventEmitter } from 'events';

export default class AsyncToken<T> extends EventEmitter {

    public complete: Promise<T> | undefined = undefined;

    public update: any = {
        on: (callback: any) => {
            this.on('update', callback);
        }
    }

    constructor() {
        super();
    }
}
