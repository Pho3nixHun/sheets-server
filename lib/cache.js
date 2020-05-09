let _lastWrite = new Map();
let _value = new Map();

module.exports = class Cache {
    constructor(ttl = 0) {
        this.ttl = ttl;
        this.invalidate();
    }

    invalidate() {
        _lastWrite.set(this, 0);
    }

    get lastWrite() {
        return _lastWrite.get(this);
    }

    get isValid() {
        return !!(this.value && (this.lastWrite + this.ttl) > Date.now());
    }

    get value() {
        return _value.get(this);
    }

    set value(value) {
        _lastWrite.set(this, Date.now());
        _value.set(this, value);
    }
}