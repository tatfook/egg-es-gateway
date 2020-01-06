'use strict';

module.exports = {
    type: 'object',
    title: 'update site visibility',
    additionalProperties: false,
    properties: {
        visibility: {
            type: 'string',
            enum: ['public', 'private'],
        },
    },
    required: ['visibility'],
};
