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
  router.resources('/packages', controller.package);
  router.resources('/projects', controller.project);
};
