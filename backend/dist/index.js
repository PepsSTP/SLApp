"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const api_1 = __importDefault(require("./routes/api"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// Middleware
app.use((0, helmet_1.default)()); // Security headers
app.use((0, cors_1.default)()); // Enable CORS
app.use((0, morgan_1.default)('dev')); // Logging
app.use(express_1.default.json()); // Parse JSON bodies
app.use(express_1.default.urlencoded({ extended: true })); // Parse URL-encoded bodies
// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
// API routes
app.use('/api', api_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.url} not found`
    });
});
// Error handler
app.use((err, _req, res) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});
// Start server
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    console.log(`📝[server]: Environment: ${process.env.NODE_ENV || 'development'}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map