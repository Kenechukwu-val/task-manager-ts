import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app, createTestUser, getToken } from './helpers';

let createdTaskId: string;

beforeAll(async () => {
    await createTestUser();
});

describe('Task API', () => {
    it('should create a task', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${getToken()}`)
            .send({ title: 'Test task', priority: 'high' });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.task.title).toBe('Test task');
        createdTaskId = res.body.task.id;
    });

    it('should list tasks with pagination', async () => {
        const res = await request(app)
            .get('/api/tasks?page=1&limit=5')
            .set('Authorization', `Bearer ${getToken()}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.tasks)).toBe(true);
        expect(res.body.pagination).toBeDefined();
        expect(res.body.pagination.page).toBe(1);
        expect(res.body.pagination.limit).toBe(5);
    });

    it('should filter tasks by status', async () => {
        const res = await request(app)
            .get('/api/tasks?status=pending')
            .set('Authorization', `Bearer ${getToken()}`);

        expect(res.status).toBe(200);
        expect(res.body.tasks.every((t: any) => t.status === 'pending')).toBe(true);
    });

    it('should update a task', async () => {
        const res = await request(app)
            .put(`/api/tasks/${createdTaskId}`)
            .set('Authorization', `Bearer ${getToken()}`)
            .send({ title: 'Updated task', status: 'in-progress' });

        expect(res.status).toBe(200);
        expect(res.body.task.title).toBe('Updated task');
        expect(res.body.task.status).toBe('in-progress');
    });

    it('should delete a task', async () => {
        const res = await request(app)
            .delete(`/api/tasks/${createdTaskId}`)
            .set('Authorization', `Bearer ${getToken()}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('should reject unauthenticated requests', async () => {
        const res = await request(app).get('/api/tasks');
        expect(res.status).toBe(401);
    });

    it('should validate task input', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${getToken()}`)
            .send({ title: '' });

        expect(res.status).toBe(400);
    });
});
