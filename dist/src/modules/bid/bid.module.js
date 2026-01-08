"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BidModule = void 0;
const common_1 = require("@nestjs/common");
const bid_service_1 = require("./bid.service");
const bid_controller_1 = require("./bid.controller");
const bid_repository_1 = require("./repositories/bid.repository");
const auction_module_1 = require("../auction/auction.module");
let BidModule = class BidModule {
};
exports.BidModule = BidModule;
exports.BidModule = BidModule = __decorate([
    (0, common_1.Module)({
        imports: [auction_module_1.AuctionModule],
        controllers: [bid_controller_1.BidController],
        providers: [bid_service_1.BidService, bid_repository_1.BidRepository],
        exports: [bid_service_1.BidService, bid_repository_1.BidRepository],
    })
], BidModule);
//# sourceMappingURL=bid.module.js.map