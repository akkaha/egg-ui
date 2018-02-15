const PROXY_CONFIG = [
    {
        context: [
            "/egg",
        ],
        target: "http://localhost:8080",
        pathRewrite: {
            '^/egg': 'egg'
        },
        ws: false,
        secure: false
    },
]

module.exports = PROXY_CONFIG
