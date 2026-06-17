import request from 'supertest';
import { app } from '../app';

const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'testpassword123';

let token: string;

export const createTestUser = async () => {
    const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User', email: TEST_EMAIL, password: TEST_PASSWORD });

    if (res.body.success) {
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: TEST_EMAIL, password: TEST_PASSWORD });
        token = loginRes.body.token;
        return { token, user: loginRes.body.user };
    }

    const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    if (!loginRes.body.success) {
        throw new Error('Could not create or login test user');
    }

    token = loginRes.body.token;
    return { token, user: loginRes.body.user };
};

export const getToken = () => token;
export { app };
