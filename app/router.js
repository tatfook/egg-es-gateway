'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  const url_prefix = app.config.url_prefix;
  if (url_prefix) { router.prefix(url_prefix); }

  router.get('/', controller.home.index);

  router.resources('/users', controller.user);
  router.post('/users/:id/upsert', controller.user.upsert);

  router.resources('/packages', controller.package);
  router.post('/packages/:id/upsert', controller.package.upsert);
  router.get('/hots/packages', controller.package.hots);

  router.resources('/projects', controller.project);
  router.post('/projects/:id/upsert', controller.project.upsert);
  router.get('/hots/projects', controller.project.hots);
  router.get('/likes/projects', controller.project.likes);

  router.resources('/sites', controller.site);
  router.post('/sites/:id/upsert', controller.site.upsert);

};
