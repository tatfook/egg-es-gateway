'use strict';

module.exports = {
    type: 'object',
    title: 'delete folder path',
    additionalProperties: false,
    properties: {
        folderpath: { type: 'string' },
        username: { type: 'string' },
        sitename: { type: 'string' },
    },
    required: ['folderpath', 'username', 'sitename'],
};
