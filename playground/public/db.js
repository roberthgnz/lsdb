import Lsdb from './lib/index.js';

export function setupDb() {
    return new Lsdb('playground');
}