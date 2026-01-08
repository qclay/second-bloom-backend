"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseConfig = void 0;
const config_1 = require("@nestjs/config");
exports.firebaseConfig = (0, config_1.registerAs)('firebase', () => ({
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    databaseURL: process.env.FIREBASE_DATABASE_URL || '',
}));
//# sourceMappingURL=firebase.config.js.map