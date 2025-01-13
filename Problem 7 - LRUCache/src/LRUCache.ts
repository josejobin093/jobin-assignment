import { promises as fs } from 'fs';
import * as path from 'path';
import { Node } from './Node';
import { IItem, Item } from './Item';

interface ILRUCache {
    
    set(key: string, value: string, TTL_milliseconds: number): Promise<boolean>;
    get(key: string): Promise<string | null>;
}

class LRUCache implements ILRUCache {

    private items: Map<string, InstanceType<typeof Item>>;
    private orderOfItems: Map<string, InstanceType<typeof Node>>;

    private leastRecentItem: string | null;
    private mostRecentItem: string | null;

    private readonly capacity: number = 3;

    constructor() {
        this.items = new Map<string, InstanceType<typeof Item>>();
        this.orderOfItems = new Map<string, InstanceType<typeof Node>>();
        this.leastRecentItem = null;
        this.mostRecentItem = null;

        if (this.capacity < 1)
            throw new Error("capacity has to be a positive integer greater than 0");
    }

    public async set(key: string, value: string, TTL_milliseconds: number): Promise<boolean> {
        let item = this.items.get(key);
        
        if (item === undefined)
            item = new Item(key);

        const success: boolean = await item.setValue(value, TTL_milliseconds);
        if (!success)
            return false;

        let node: Node | undefined = this.orderOfItems.get(key);
        
        if (node === undefined) {
            node = new Node(key);
            
            this.setMostRecent(key, node);
            while (this.items.size >= this.capacity)
                this.removeItem();

            if (this.leastRecentItem === null)
                this.leastRecentItem = key;

            this.items.set(key, item);
            this.orderOfItems.set(key, node);
        }
        else
            this.setMostRecent(key, node);

        return true;
    }

    public async get(key: string): Promise<string | null> {
        const item = this.items.get(key);
        
        if (item === undefined)
            return null;

        if (item.isExpired())
            return null;

        let value: string = await item.getValue();

        let node: Node | undefined = this.orderOfItems.get(key);
        if (node === undefined)
            throw new Error("node does not exist");

        this.setMostRecent(key, node);

        return value;
    }

    public print() {
        console.log("============================================================================================");
        this.printOrder();
        
        
        console.log("mostRecentItem = " + JSON.stringify(this.mostRecentItem));
        console.log("leastRecentItem = " + JSON.stringify(this.leastRecentItem));
    }

    public printOrder() {
        let orderStr = "";
        let key = this.leastRecentItem;
        while(key)
        {
            orderStr += key;
            let node = this.orderOfItems.get(key);
            if(node)
                key = node.nextNode;
            if(key != null)
                orderStr += " -> ";
        }

        console.log("Order of items : " + orderStr);
    }

    private setMostRecent(key: string, node: Node) {
        
        if(key === this.leastRecentItem)
        {
            let leastRecentNode = this.orderOfItems.get(this.leastRecentItem);

            if(leastRecentNode)
                this.leastRecentItem = leastRecentNode.nextNode;
        }

        if (node.prevNode !== null) {
            let prevNode = this.orderOfItems.get(node.prevNode);

            if (prevNode) {
                if (node.nextNode === null)
                    prevNode.nextNode = null;
                else
                    prevNode.nextNode = node.nextNode;
            }
        }

        if (node.nextNode !== null) {
            let nextNode = this.orderOfItems.get(node.nextNode);

            if (nextNode) {
                if (node.prevNode === null)
                    nextNode.prevNode = null;
                else
                    nextNode.prevNode = node.prevNode;
            }
        }

        if (this.mostRecentItem !== null)
        {
            let mostRecentNode = this.orderOfItems.get(this.mostRecentItem);

            if(mostRecentNode)
            {
                node.prevNode = this.mostRecentItem;
                node.nextNode = null;

                mostRecentNode.nextNode = key;
            }
        }

        this.mostRecentItem = key;
    }

    private removeItem() {
        if (this.leastRecentItem === null)
            return;

        let node: Node | undefined = this.orderOfItems.get(this.leastRecentItem);
        if (node === undefined)
            throw new Error("node does not exist");

        let item: IItem | undefined = this.items.get(this.leastRecentItem);
        if (item === undefined)
            throw new Error("item does not exist");

        item.deleteDataFromDisk();
        this.items.delete(this.leastRecentItem);
        this.orderOfItems.delete(this.leastRecentItem);

        if (node.nextNode === null)
        {
            this.leastRecentItem = null;
            this.mostRecentItem = null;
        }
        else
            this.leastRecentItem = node.nextNode;
    }

}

export { LRUCache };
