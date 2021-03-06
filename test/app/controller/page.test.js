'use strict';

const { app, assert } = require('egg-mock/bootstrap');
const faker = require('faker');

describe('test/app/controller/page.test.js', () => {
    const username = faker.internet.userName();
    const sitename = faker.internet.domainName();

    const page = {
        id: faker.random.number(),
        title: faker.name.title(),
        url: faker.internet.url(),
        site: faker.internet.domainName(),
        username: faker.internet.userName(),
        visibility: faker.helpers.randomize(['private', 'public']),
        content: faker.lorem.text(),
        created_at: faker.date.past(),
        updated_at: faker.date.past(),
    };

    it('should PUT /sites/:username/:sitename/visibility', () => {
        const visibility = 'private';
        return app
            .httpRequest()
            .put(`/sites/${username}/${sitename}/visibility`)
            .set(app.authHeader)
            .send({ visibility })
            .expect(200);
    });

    it('should DELETE /sites/:username/:sitename', () => {
        return app
            .httpRequest()
            .delete(`/sites/${username}/${sitename}`)
            .set(app.authHeader)
            .expect(200);
    });

    it('should POST /sites/:username/:sitename/rename_folder', () => {
        return app
            .httpRequest()
            .post(`/sites/${username}/${sitename}/rename_folder`)
            .set(app.authHeader)
            .send({
                folder: faker.internet.domainName(),
                new_folder: faker.internet.domainName(),
            })
            .expect(200);
    });

    it('should POST /pages', () => {
        return app
            .httpRequest()
            .post('/users')
            .set(app.authHeader)
            .send(page)
            .expect(201);
    });

    it('should PUT /pages/:id', () => {
        return app
            .httpRequest()
            .put(`/pages/${page.id}`)
            .set(app.authHeader)
            .send(page)
            .expect(200);
    });

    it('should delete /pages/:id', () => {
        return app
            .httpRequest()
            .delete(`/pages/${page.id}`)
            .set(app.authHeader)
            .expect(200);
    });

    it('should get /pages', async () => {
        const res = await app
            .httpRequest()
            .get('/pages?q=123')
            .expect(200);

        const result = res.body;
        assert(result);
        assert(result.hits);
    });
});
