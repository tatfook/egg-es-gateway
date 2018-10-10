'use strict';

const isAdmin = user => {
  return user.roleId === 10;
};

module.exports = {
  ensureAdmin() {
    const errMsg = 'Admin Only';
    this.state = this.state || {};
    this.state.user = this.state.user || {};
    const not_permitted = !this.state.user.roleId || !isAdmin(this.state.user);
    if (not_permitted) { this.throw(404, errMsg); }
    this.user = this.state.user;
  },
};
