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

    router.get('/', controller.home.index);

    router.post('/bulk', base.bulk);
    router.delete('/clearIndexData', base.clearIndexData);

    router.resources('/users', user);
    router.post('/users/:id/upsert', user.upsert);

    router.resources('/projects', project);
    router.post('/projects/:id/upsert', project.upsert);
    router.get('/hots/projects', project.hots);
    router.get('/likes/projects', project.likes);

    router.put(
        '/sites/:username/:sitename/visibility',
        page.update_site_visibility
    );
    router.del('/sites/:username/:sitename', page.destroy_site);
    router.post(
        '/sites/:username/:sitename/rename_folder',
        page.update_folder_path
    );
    router.del(
        '/sites/:username/:sitename/folder/:folderpath',
        page.delete_folder
    );
    router.resources('/pages', page);
};
