// Configuration settings for the application
const config = {
    // API URLs
    API: {
        BASE_URL: 'http://localhost:8080/api',
        USERS: 'http://localhost:8080/api/users',
        SUPPLY_CHAINS: 'http://localhost:8080/api/supply-chains',
    },
    
    // Token settings
    AUTH: {
        TOKEN_KEY: 'token',
        USER_ID_KEY: 'userId',
        USERNAME_KEY: 'username',
        ROLE_KEY: 'role',
        WALLET_KEY: 'walletAddress',
    },
    
    // Application settings
    APP: {
        DEFAULT_ITEMS_PER_PAGE: 16,
        DEFAULT_VIEWPORT: { x: 0, y: 0, zoom: 1 },
    }
};

export default config;