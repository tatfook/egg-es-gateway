'use strict';

const Controller = require('./base');
const uuid = require('uuid/v4');

class PagesController extends Controller {
    async index() {
        const { ctx, service } = this;
        // if (!ctx.query.q) {
        //     ctx.body = {
        //         total: 0,
        //         hits: [],
        //     };
        //     return;
        // }
        const [from, size] = ctx.helper.paginate(ctx.query);
        const query = { from, size, body: ctx.service.page.get_search_DSL() };
        const query_with_location = ctx.service.page.add_location(query);
        const result = await service.es.client.search(query_with_location);
        ctx.body = ctx.service.page.wrap_search_result(result);
    }

    async create() {
        const { ctx, app, service } = this;
        const body = ctx.getParams();
        await ctx.validate(app.validator.page.create, body);
        body.lite_content =
            body.lite_content || this.getLiteContentByContent(body.content);
        body.updated_at = body.updated_at || body.created_at;
        const page = await service.page.isPageExist(body.url);
        if (page) ctx.throw('Page already exist', 409);
        const payload = { id: uuid(), body }; // use uuid as document id
        const payload_with_location = service.page.add_location(payload);
        ctx.body = await service.es.client.create(payload_with_location);
        this.created();
    }

    getLiteContentByContent(content = '') {
        // eslint-disable-next-line no-magic-numbers
        if (content.length > 150) {
            // eslint-disable-next-line no-magic-numbers
            return content.slice(0, 150) + '...';
        }
        return content;
    }

    async update() {
        const { ctx, app, service } = this;
        const doc = ctx.getParams();
        await ctx.validate(app.validator.page.update, doc);
        doc.lite_content =
            doc.lite_content || this.getLiteContentByContent(doc.content);
        const query = { body: ctx.service.page.get_update_page_DSL(doc) };
        const query_with_location = ctx.service.page.add_location(query);
        ctx.body = await service.es.client.updateByQuery(query_with_location);
        this.updated();
    }

    async destroy() {
        const { ctx, service } = this;
        ctx.ensureAdmin();
        const query = { body: ctx.service.page.get_page_DSL() };
        const query_with_location = ctx.service.page.add_location(query);
        ctx.body = await service.es.client.deleteByQuery(query_with_location);
        this.deleted();
    }

    async destroy_site() {
        const { ctx, service } = this;
        ctx.ensureAdmin();
        const query = {
            body: ctx.service.page.get_site_DSL(),
        };
        const query_with_location = ctx.service.page.add_location(query);
        ctx.body = await service.es.client.deleteByQuery(query_with_location);
        this.deleted();
    }

    async update_site_visibility() {
        const { ctx, service, app } = this;
        ctx.ensureAdmin();
        await ctx.validate(
            app.validator.page.updateSiteVisibility,
            ctx.getParams()
        );
        const query = { body: ctx.service.page.get_update_visibility_DSL() };
        const query_with_location = ctx.service.page.add_location(query);
        ctx.body = await service.es.client.updateByQuery(query_with_location);
        this.updated();
    }

    async update_folder_path() {
        const { ctx, service, app } = this;
        ctx.ensureAdmin();
        await ctx.validate(
            app.validator.page.updateFolderPath,
            ctx.getParams()
        );
        const query = { body: ctx.service.page.get_update_folder_DSL() };
        const query_with_location = ctx.service.page.add_location(query);
        ctx.body = await service.es.client.updateByQuery(query_with_location);
        this.updated();
    }

    async delete_folder() {
        const { ctx, service, app } = this;
        ctx.ensureAdmin();
        await ctx.validate(app.validator.page.deleteFolder, ctx.getParams());
        const query = { body: ctx.service.page.get_delete_folder_DSL() };
        const query_with_location = ctx.service.page.add_location(query);
        ctx.body = await service.es.client.deleteByQuery(query_with_location);
        this.deleted();
    }
}

module.exports = PagesController;
