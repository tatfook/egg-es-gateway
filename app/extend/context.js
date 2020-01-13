'use strict';
const _ = require('lodash');

module.exports = {
    ensureAdmin() {
        const errMsg = 'Admin Only';
        const INTERNAL_API_KEY = this.app.config.INTERNAL_API_KEY;
        const not_permitted = this.getParams().apiKey !== INTERNAL_API_KEY;
        if (not_permitted) {
            this.throw(401, errMsg);
        }
    },
    getParams() {
        return _.merge({}, this.request.body, this.query, this.params);
    },
};
