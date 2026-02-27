// Set required environment variables for testing
process.env.NODE_ENV = 'test';
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
process.env.GOOGLE_CALLBACK_URL = 'http://localhost:8000/auth/google/callback';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.REFRESH_JWT_SECRET = 'test-refresh-jwt-secret-key-for-testing';
process.env.SESSION_SECRET = 'test-session-secret';
process.env.ARCJET_KEY = 'ajkey_test_000000000000';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';
process.env.PORT = '8000';
