"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const busController_1 = __importDefault(require("../controllers/busController"));
const router = (0, express_1.Router)();
/**
 * Bus Routes
 * GET /api/buses/:stopName/grouped - Get buses grouped by line for a specific stop
 * GET /api/buses/:stopName - Get buses for a specific stop from SL API
 */
router.get('/buses/:stopName/grouped', (req, res) => busController_1.default.getBusesByStopGrouped(req, res));
router.get('/buses/:stopName', (req, res) => busController_1.default.getBusesByStop(req, res));
exports.default = router;
//# sourceMappingURL=api.js.map