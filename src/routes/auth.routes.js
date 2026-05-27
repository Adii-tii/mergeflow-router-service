const { Router } = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const router = Router();
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL;


router.get("/api/auth/success", (req, res) => {
    const token = req.query.token;
    const isProd = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "None" : "Lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // important: ensure cookie flushed on 5000 response
    const redirectUrl = process.env.CLIENT_URL ? `${process.env.CLIENT_URL}/dashboard` : "http://localhost:5173/dashboard";
    res.status(302).set("Location", redirectUrl).end();
});

router.post("/api/auth/logout", (req, res) => {
    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie("token", {
        path: "/",
        sameSite: isProd ? "None" : "Lax",
        secure: isProd,
        httpOnly: true
    });
    res.status(200).json({ success: true, message: "Logged out successfully" });
});

router.use(
    "/api/auth",
    createProxyMiddleware({
        target: AUTH_SERVICE,
        changeOrigin: true,
        on: {
            proxyReq: (proxyReq, req) => {
                proxyReq.path = req.originalUrl;
            },
        },
    })
);



router.use(
    "/api/users",
    createProxyMiddleware({
        target: AUTH_SERVICE,
        changeOrigin: true,
        on: {
            proxyReq: (proxyReq, req) => {
                proxyReq.path = req.originalUrl;
            },
        },
    })
);

module.exports = router;
