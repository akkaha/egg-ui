const PROXY_CONFIG = [
    {
        context: [
            "/api",
        ],
        target: "http://localhost:8080",
        pathRewrite: {
            '^/api': ''
        },
        ws: false,
        secure: false
    },
]

module.exports = PROXY_CONFIG
