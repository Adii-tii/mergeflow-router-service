const { Router } = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const router = Router();
const AI_SERVICE = process.env.AI_SERVICE_URL;

// All AI routes go to the AI agent — restore full path so the agent sees /api/ai/*
router.use(
    "/api/ai",
    createProxyMiddleware({
        target: AI_SERVICE,
        changeOrigin: true,
        on: {
            proxyReq: (proxyReq, req) => {
                proxyReq.path = req.originalUrl;
            },
        },
    })
);

// /api/risk and /api/security are aliases pointing to AI agent routes at /api/ai/risk and /api/ai/security
router.use(
    "/api/risk",
    createProxyMiddleware({
        target: AI_SERVICE,
        changeOrigin: true,
        on: {
            proxyReq: (proxyReq, req) => {
                proxyReq.path = req.originalUrl.replace("/api/risk", "/api/ai/risk");
            },
        },
    })
);

router.use(
    "/api/security",
    createProxyMiddleware({
        target: AI_SERVICE,
        changeOrigin: true,
        on: {
            proxyReq: (proxyReq, req) => {
                proxyReq.path = req.originalUrl.replace("/api/security", "/api/ai/security");
            },
        },
    })
);

module.exports = router;
