
class Node {

    private _key: string;
    private _nextNode: string | null;
    private _prevNode: string | null;

    constructor(key: string) {
        this._key = key;
        this._nextNode = null;
        this._prevNode = null;
    }

    get nextNode(): string | null {
        return this._nextNode;
    }

    set nextNode(key: string | null) {
        this._nextNode = key;
    }

    set prevNode(key: string | null) {
        this._prevNode = key;
    }
}

export { Node };
