/* eslint-disable no-magic-numbers */
'use strict';

const Service = require('egg').Service;
const _ = require('lodash');

const SCORE_FIELD = '_score';
const UPDATED_AT_FIELD = 'updated_at';
const DESC_ORDER = 'desc';

class DSLService extends Service {
    add_location(payload, data_type, index_only) {
        const { index, type } = this.app.config.elasticsearch.locations[
            data_type
        ];
        payload.index = index;
        if (!index_only) {
            payload.type = type;
        }
        return payload;
    }

    add_highlight_DSL(DSL, fields) {
        const tag = this.app.config.highlight_tag;
        if (fields.length > 0) {
            DSL.highlight = {
                fields: {},
                pre_tags: `<${tag}>`,
                post_tags: `</${tag}>`,
            };
            for (const field of fields) {
                DSL.highlight.fields[field] = {};
            }
        }
        return DSL;
    }

    max_expansions() {
        const { ctx } = this;
        const query_length = ctx.query.q;
        let max_expansions;
        if (query_length > 36) {
            max_expansions = 10;
        } else if (query_length > 12) {
            max_expansions = Math.floor(query_length / 4) + 1;
        } else if (query_length > 3) {
            max_expansions = Math.floor(query_length / 3);
        } else {
            max_expansions = 1;
        }
        return max_expansions;
    }

    // method to add sorting condition into search DSL
    add_sort_DSL(
        DSL = {},
        field = this.ctx.query.sort,
        order = this.ctx.query.order
    ) {
        if (field) {
            DSL.sort = DSL.sort || [];
            DSL.sort.push({
                [field]: { order: order || DESC_ORDER },
            });
        }
        return DSL;
    }

    preset_sort_DSL(DSL = {}, fields = []) {
        const { sort, order } = this.ctx.getParams();
        if (_.isEmpty(DSL.sort)) {
            this.add_fields_to_sort(DSL, fields);
            DSL = this.add_sort_DSL(DSL, sort, order);
        }
    }

    add_fields_to_sort(DSL = {}, fields = []) {
        fields.forEach(field => {
            if (Object(field) instanceof String) {
                DSL = this.add_sort_DSL(DSL, field);
            } else if (field instanceof Object) {
                for (const name in field) {
                    const order = field[name];
                    DSL = this.add_sort_DSL(DSL, field, order);
                }
            }
        });
    }

    set_default_sort_if_empty(DSL, fields) {
        const { ctx } = this;
        if (_.isEmpty(fields)) {
            if (ctx.query.q) fields.push(SCORE_FIELD);
            fields.push(UPDATED_AT_FIELD);
        }
    }

    add_multi_sort_DSL(DSL = {}, fields = []) {
        this.preset_sort_DSL(DSL);
        this.set_default_sort_if_empty(DSL, fields);
        this.add_fields_to_sort(DSL, fields);
        return DSL;
    }

    // api for ranking such as hot, latest, etc
    async rank(field, order = DESC_ORDER) {
        const DSL = this.get_rank_DSL(field, order);
        await this.search(DSL);
    }

    get_rank_DSL(field, order) {
        const DSL = this.add_sort_DSL({}, field, order);
        return DSL;
    }
}

module.exports = DSLService;
