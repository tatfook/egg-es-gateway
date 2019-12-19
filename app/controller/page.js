'use strict';

const Controller = require('./base');
const uuid = require('uuid/v4');

class PagesController extends Controller {
    async create() {
        const { ctx, app, service } = this;
        ctx.validate(app.validator.page.create, ctx.getParams());
        const body = ctx.getParams();
        body.updated_at = body.updated_at || body.created_at;
        const page = await service.page.isPageExist(body.url);
        if (page) ctx.throw('Page already exist', 409);
        const payload = { id: uuid(), body }; // use uuid as document id
        const payload_with_location = service.page.add_location(payload);
        ctx.body = await service.es.client.create(payload_with_location);
    }

    async update() {
        const { ctx, app, service } = this;
        const doc = ctx.getParams();
        ctx.validate(app.validator.page.update, doc);
        const query = { body: ctx.service.page.get_update_page_DSL(doc) };
        const query_with_location = ctx.service.page.add_location(query);
        ctx.body = await service.es.client.updateByQuery(query_with_location);
    }

    async destroy() {
        const { ctx, service } = this;
        ctx.ensureAdmin();
        const query = { body: ctx.service.page.get_page_DSL() };
        const query_with_location = ctx.service.page.add_location(query);
        ctx.body = await service.es.client.deleteByQuery(query_with_location);
    }

    async destroy_site() {
        const { ctx, service } = this;
        ctx.ensureAdmin();
        const query = {
            body: ctx.service.page.get_site_DSL(),
        };
        const query_with_location = ctx.service.page.add_location(query);
        ctx.body = await service.es.client.deleteByQuery(query_with_location);
    }

    async update_site_visibility() {
        const { ctx, service, app } = this;
        ctx.ensureAdmin();
        ctx.validate(app.validator.page.updateSiteVisibility, ctx.getParams());
        const query = { body: ctx.service.page.get_update_visibility_DSL() };
        const query_with_location = ctx.service.page.add_location(query);
        ctx.body = await service.es.client.updateByQuery(query_with_location);
    }

    async update_folder_path() {
        const { ctx, service, app } = this;
        ctx.ensureAdmin();
        ctx.validate(app.validator.page.update_folder_path, ctx.getParams());
        const query = { body: ctx.service.page.get_update_folder_DSL() };
        const query_with_location = ctx.service.page.add_location(query);
        ctx.body = await service.es.client.updateByQuery(query_with_location);
    }

    async index() {
        const { ctx, service } = this;
        if (!ctx.params.q) {
            ctx.body = {
                total: 0,
                hits: [],
            };
            return;
        }
        const [from, size] = ctx.helper.paginate(ctx.query);
        const query = { from, size, body: ctx.service.page.get_search_DSL() };
        const query_with_location = ctx.service.page.add_location(query);
        const result = await service.es.client.search(query_with_location);
        ctx.body = ctx.service.page.wrap_search_result(result);
    }
}

module.exports = PagesController;
