'use strict';

module.exports = {
    type: 'object',
    title: 'update folder path',
    additionalProperties: false,
    properties: {
        folder: { type: 'string' },
        new_folder: { type: 'string' },
    },
    required: ['folder', 'new_folder'],
};
