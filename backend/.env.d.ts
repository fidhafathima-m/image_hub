declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV?: string;
        PORT?: string;
        MONGODB_URI: string;
        FRONTEND_URL?: string;
        JWT_SECRET: string;
    }
}