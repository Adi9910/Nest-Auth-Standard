export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  
  // Database configuration for PostgreSQL
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'taskdb',
    synchronize: process.env.DB_SYNCHRONIZE === 'true', // Auto-sync schema (dev only)
    logging: process.env.DB_LOGGING === 'true', // Log SQL queries
  },
  
  // JWT authentication configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  
  // Redis cache configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    ttl: parseInt(process.env.REDIS_TTL, 10) || 300, // Cache TTL in seconds
  },
});