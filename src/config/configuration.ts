export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  
  // Database configuration for PostgreSQL
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    username: process.env.DB_USERNAME,
    password: "Shyaddu#@1",
    name: process.env.DB_NAME,
    synchronize: process.env.DB_SYNCHRONIZE === 'true', // Auto-sync schema (dev only)
    logging: process.env.DB_LOGGING === 'true', // Log SQL queries
  },
  
  // JWT authentication configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  
  // Redis cache configuration
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    ttl: parseInt(process.env.REDIS_TTL, 10) || 300, // Cache TTL in seconds
  },
});