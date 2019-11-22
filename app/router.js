'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
    const { router, controller } = app;
    const url_prefix = app.config.url_prefix;
    if (url_prefix) {
        router.prefix(url_prefix);
    }

    const { base, user, project, page } = controller;
    const lesson = controller.package;

    router.get('/', controller.home.index);

    router.post('/bulk', base.bulk);
    router.get('/suggestions', project.suggest);

    router.resources('/users', user);
    router.post('/users/:id/upsert', user.upsert);

    router.resources('/packages', lesson);
    router.post('/packages/:id/upsert', lesson.upsert);
    router.get('/hots/packages', lesson.hots);

    router.resources('/projects', project);
    router.post('/projects/:id/upsert', project.upsert);
    router.get('/hots/projects', project.hots);
    router.get('/likes/projects', project.likes);

    router.put('/sites/:username/:sitename/visibility', page.update_visibility);
    router.del('/sites/:username/:sitename', page.destroy_site);
    router.resources('/pages', page);
};
