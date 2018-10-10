'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  const url_prefix = app.config.url_prefix;
  if (url_prefix) { router.prefix(url_prefix); }

  router.use(app.jwt);

  router.get('/', controller.home.index);

  router.resources('/users', controller.user);
  router.resources('/packages', controller.package);
  router.resources('/projects', controller.project);
  router.resources('/sites', controller.site);

  router.get('/hots/projects', controller.project.hots);
  router.get('/likes/projects', controller.project.likes);

  router.get('/hots/packages', controller.package.hots);
};
