import { promises as fs } from 'fs';
import * as path from 'path';
import XXHash from 'xxhash-wasm';

interface IItem {
    
    isExpired(): boolean;
    setValue(value: string, TTL_milliseconds: number): Promise<boolean>;
    getValue(): Promise<string>;
    deleteDataFromDisk(): Promise<boolean>;
}

class Item implements IItem {

    private key: string;
    private hash: string | null;
    private expiresAt: number | null;

    private readLocks: number;
    private isWriteLocked: boolean;

    private nextNode: string | null;
    private prevNode: string | null;

    private readonly dataPath: string = __dirname + "/data/";

    constructor(key: string) {
        this.key = key;
        this.hash = null;
        this.expiresAt = null;
        this.readLocks = 0;
        this.isWriteLocked = false;
        this.nextNode = null;
        this.prevNode = null;
    }

    public isExpired(): boolean {
        if (this.expiresAt == null)
            throw new Error("Item not initialized");
        
        return this.expiresAt < Date.now();
    }

    public async setValue(value: string, TTL_milliseconds: number): Promise<boolean> {
        this.expiresAt = Date.now() + TTL_milliseconds;

        const fileContents = JSON.stringify({
            expiresAt: this.expiresAt,
            value: value
        });

        if (this.hash === null)
            this.hash = await this.generateHash();

        if (!this.setWriteLock())
            return false;

        const filePath = this.getFilePath();
        await fs.writeFile(filePath, fileContents);

        this.releaseWriteLock();
        return true;
    }

    public async getValue(): Promise<string> {
        if (!this.setReadLock())
            throw new Error("Failed to lock file for reading");

        const filePath = this.getFilePath();
        const data = await fs.readFile(filePath, 'utf8');

        this.releaseReadLock();

        const obj = JSON.parse(data);
        return obj.value;
    }

    public async deleteDataFromDisk(): Promise<boolean> {
        if (!this.setWriteLock())
            return false;

        const filePath = this.getFilePath();
        await fs.unlink(filePath);

        this.releaseWriteLock();
        return true;
    }

    private setReadLock(): boolean {
        if (!this.isWriteLocked) {
            this.readLocks++;
            return true;
        } 
        else
            return false;
    }

    private releaseReadLock() {
        if(this.readLocks > 0)
            this.readLocks--;
    }

    private setWriteLock(): boolean {
        if (this.readLocks == 0 && !this.isWriteLocked) {
            this.isWriteLocked = true;
            return true;
        } 
        else
            return false;
    }

    private releaseWriteLock() {
        this.isWriteLocked = false;
    }

    private async generateHash(): Promise<string> {
        const XXH = await XXHash();
        return XXH.h64(this.key).toString(16);
    }

    private getFilePath(): string {
        if (this.hash === null)
            throw new Error("hash not set");

        return path.join(this.dataPath, this.hash);
    }
}

export { IItem, Item };
