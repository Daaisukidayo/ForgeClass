"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgeClass = void 0;
const forgescript_1 = require("@tryforge/forgescript");
const managers_1 = require("./managers");
const package_json_1 = require("../package.json");
const path_1 = __importDefault(require("path"));
class ForgeClass extends forgescript_1.ForgeExtension {
    name = "ForgeClass";
    description = package_json_1.description;
    version = package_json_1.version;
    /** The class registry, also at `client.classes`. */
    classes = new managers_1.ClassManager();
    /** The ForgeClass of a client. Throws when it isn't in the extensions. */
    static of(client) {
        return client.getExtension(ForgeClass, true);
    }
    /** Loads the functions and sets `client.classes`. */
    init(client) {
        this.load(path_1.default.resolve(__dirname, "native"));
        client.classes = this.classes;
    }
}
exports.ForgeClass = ForgeClass;
__exportStar(require("./managers"), exports);
__exportStar(require("./structures"), exports);
__exportStar(require("./types"), exports);
//# sourceMappingURL=index.js.map