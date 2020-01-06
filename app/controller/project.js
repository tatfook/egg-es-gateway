'use strict';

const Controller = require('./base');

class ProjectController extends Controller {
    async index() {
        const { ctx, service } = this;
        const [from, size] = ctx.helper.paginate(ctx.query);
        const query = { from, size, body: service.project.get_search_DSL() };
        const query_with_location = service.project.add_location(query);
        const result = await service.es.client.search(query_with_location);
        ctx.body = service.project.wrap_search_result(result);
    }

    async hots() {
        await this.rank('recent_view');
    }

    async likes() {
        await this.rank('recent_like');
    }

    async rank(field, order = 'desc') {
        const { ctx, service } = this;
        const query = service.project.get_rank_DSL(field, order);
        const query_with_location = service.project.add_location(query);
        const result = await service.es.client.search(query_with_location);
        ctx.body = service.project.wrap_search_result(result);
    }

    async create() {
        const { ctx, app, service } = this;
        const data = ctx.getParams();
        await ctx.validate(app.validator.project.create, data);
        data.updated_at = data.created_at;
        const payload = { id: data.id, body: data };
        const payload_with_location = service.project.add_location(payload);
        ctx.body = await service.es.client.create(payload_with_location);
        this.created();
    }

    async update() {
        const { ctx, app, service } = this;
        const doc = ctx.getParams();
        const id = doc.id;
        await ctx.validate(app.validator.project.update, doc);

        const data = { doc };
        const payload = { id, body: data };
        const payload_with_location = service.project.add_location(payload);
        ctx.body = await service.es.client.update(payload_with_location);
        this.updated();
    }

    async upsert() {
        const { ctx, app, service } = this;
        const data = ctx.getParams();
        await ctx.validate(app.validator.project.upsert, data);
        data.updated_at = data.updated_at || data.created_at;
        const payload = { id: data.id, body: data };
        const payload_with_location = service.project.add_location(payload);
        ctx.body = await service.es.client.index(payload_with_location);
        this.upserted();
    }

    async destroy() {
        const { ctx, service } = this;
        ctx.ensureAdmin();
        const query = { id: ctx.getParams().id };
        const query_with_location = service.project.add_location(query);
        ctx.body = await service.es.safeDelete(query_with_location);
        this.deleted();
    }
}

module.exports = ProjectController;
