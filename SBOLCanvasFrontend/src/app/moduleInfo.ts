

export class ModuleInfo {
    static counter: number = 0;
    displayID: string;
    name: string;
    description: string;
    version: string;
    uriPrefix: string;

    constructor() {
        this.displayID = 'module' + (ModuleInfo.counter++);
    }

    makeCopy() {
        const copy: ModuleInfo = new ModuleInfo();
        copy.displayID = this.displayID;
        copy.name = this.name;
        copy.description = this.description;
        copy.version = this.version;
        copy.uriPrefix = this.uriPrefix;
        return copy;
    }

    copyDataFrom(other: ModuleInfo) {
        this.displayID = other.displayID;
        this.name = other.name;
        this.description = other.description;
        this.version = other.version;
        this.uriPrefix = other.uriPrefix;
    }

    getFullURI(): string {
        let fullURI = this.uriPrefix + '/' + this.displayID;
        if (this.version && this.version.length > 0) {
            fullURI += '/' + this.version;
        }
        return fullURI;
    }

    encode(enc: any) {
        let node = enc.document.createElement('ModuleInfo');
        if (this.displayID)
            node.setAttribute("displayID", this.displayID);
        if (this.name && this.name.length > 0)
            node.setAttribute("name", this.name);
        if (this.description && this.description.length > 0)
            node.setAttribute("description", this.description);
        if (this.version && this.version.length > 0)
            node.setAttribute("version", this.version);

        return node;
    }
}