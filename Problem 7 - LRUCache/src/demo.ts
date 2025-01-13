import { LRUCache } from './LRUCache';

async function demo() {

    let cache:LRUCache = new LRUCache();

    await cache.set("key_1", "AAAAA", 60 * 1000);
    cache.print();

    await cache.set("key_2", "BBBBB", 60 * 1000);
    cache.print();

    await cache.set("key_3", "CCCCC", 60 * 1000);
    cache.print();

    await cache.set("key_4", "DDDDD", 60 * 1000);
    cache.print();

    await cache.set("key_5", "EEEEEE", 60 * 1000);
    cache.print();

    await cache.set("key_6", "FFFFFF", 60 * 1000);
    cache.print();

    console.log("Value of key_4 = " + await cache.get("key_4"));
    
}

demo();
