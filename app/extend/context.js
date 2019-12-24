'use strict';
const _ = require('lodash');

const isAdmin = user => {
    return user.roleId === 10; //eslint-disable-line
};

module.exports = {
    ensureAdmin() {
        const errMsg = 'Admin Only';
        this.state = this.state || {};
        this.state.user = this.state.user || {};
        const not_permitted =
            !this.state.user.roleId || !isAdmin(this.state.user);
        if (not_permitted) {
            this.throw(401, errMsg);
        }
        this.user = this.state.user;
    },
    getParams() {
        return _.merge({}, this.request.body, this.query, this.params);
    },
};
