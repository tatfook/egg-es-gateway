'use strict';

const { app, assert } = require('egg-mock/bootstrap');
const faker = require('faker');

describe('test/app/controller/project.test.js', () => {
    const project = {
        id: faker.random.number(),
        name: faker.name.title(),
        username: faker.name.firstName(),
        visibility: faker.helpers.randomize(['public', 'private']),
        type: faker.helpers.randomize(['website', 'paracraft']),
        cover: faker.internet.avatar(),
        recruiting: faker.random.boolean(),
        recommended: faker.random.boolean(),
        tags: ['game'],
        sys_tags: ['game'],
        description: faker.lorem.text(),
        point: faker.random.number({ min: 70, max: 100 }),
        total_like: faker.random.number(),
        total_view: faker.random.number(),
        total_mark: faker.random.number(),
        total_comment: faker.random.number(),
        recent_like: faker.random.number(),
        recent_view: faker.random.number(),
        created_at: faker.date.past(),
        updated_at: faker.date.past(),
    };

    it('should POST /projects', () => {
        return app
            .httpRequest()
            .post('/projects')
            .query({ apiKey: app.config.INTERNAL_API_KEY })
            .send(project)
            .expect(201);
    });

    it('should PUT /projects/:id', () => {
        return app
            .httpRequest()
            .put(`/projects/${project.id}`)
            .query({ apiKey: app.config.INTERNAL_API_KEY })
            .send(project)
            .expect(200);
    });

    it('should delete /projects/:id', () => {
        return app
            .httpRequest()
            .delete(`/projects/${project.id}`)
            .query({ apiKey: app.config.INTERNAL_API_KEY })
            .expect(200);
    });

    it('should post /projects/:id/upsert', () => {
        return app
            .httpRequest()
            .post(`/projects/${project.id}/upsert`)
            .query({ apiKey: app.config.INTERNAL_API_KEY })
            .send(project)
            .expect(200);
    });

    it('should get /projects', async () => {
        const res = await app
            .httpRequest()
            .get('/projects?q=123')
            .expect(200);

        const result = res.body;
        assert(result);
        assert(result.hits);
        assert(result.total);
    });
});
