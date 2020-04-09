const openApiDocumentation = {
    openapi: '3.0.1',
    info: {
        version: '0.0.1',
        title: 'API Lab',
        description: 'Node.js API template project',
        termsOfService: '',
        contact: {
            name: 'Asta86',
            email: 'psljp@protonmail.com',
            url: 'https://asta86.gitlab.io',
        },
        license: {
            name: 'Apache 2.0',
            url: 'https://www.apache.org/licenses/LICENSE-2.0.html',
        },
    },
    servers: [
        {
            url: 'http://localhost:8080/',
            description: 'Local server',
        },
        {
            url: 'https://l086.herokuapp.com/',
            description: 'Development server',
        },
    ],
    tags: [
        {
            name: 'CRUD operations',
            name: 'Status report'
        },
    ],
    paths: {
        '/api/status': {
            get: {
                tags: ['Status report'],
                description: 'Get API Lab services status.',
                operationId: 'getStatusReport',
                parameters: [],
                responses: {
                    '200': {
                        description: 'Status report obtained.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/StatusReport',
                                },
                            },
                        },
                    },
                },
            }
        },
        '/api/pageviews': {
            get: {
                tags: ['CRUD operations'],
                description: 'Get Page Views. If no filters are provided all records are retrieved.',
                operationId: 'getPageViews',
                parameters: [
                    {
                        name: 'Origin',
                        in: 'header',
                        schema: {
                          $ref: '#/components/schemas/originheader'
                        },
                        required: true,
                        description: 'Indicates where the request originates from.'
                    },
                    {
                        name: 'limit',
                        in: 'query',
                        schema: {
                            type: 'integer'
                        },
                        required: false,
                        description: 'Number of records to fetch. Can be used alone or combined with from and to.',
                        example: 5
                    },
                    {
                        name: 'from',
                        in: 'query',
                        schema: {
                            type: 'string'
                        },
                        required: false,
                        description: 'Initial date in format yyyy-mm-dd. Has to be used along with to.',
                        example: '2020-04-07'
                    },
                    {
                        name: 'to',
                        in: 'query',
                        schema: {
                            type: 'string'
                        },
                        required: false,
                        description: 'End date in format yyyy-mm-dd. Has to be used along with from.',
                        example: '2020-04-08'
                    },
                ],
                responses: {
                    '200': {
                        description: 'Page Views were obtained.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/PageView',
                                },
                            },
                        },
                    },
                    '400': {
                        description: 'Missing or extraneous parameters.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Error',
                                },
                                example: {
                                    message: 'Invalid search query'
                                },
                            },
                        },
                    },
                },
            },
        },
        '/api/newpageview': {
            post: {
                tags: ['CRUD operations'],
                description: 'Create and store a new Page View event.',
                operationId: 'createPageView',
                parameters: [
                    {
                        name: 'Origin',
                        in: 'header',
                        schema: {
                          $ref: '#/components/schemas/originheader'
                        },
                        required: true,
                        description: 'Indicates where the request originates from.'
                    },
                    {
                        name: 'Accept-Language',
                        in: 'header',
                        schema: {
                          $ref: '#/components/schemas/aclheader'
                        },
                        required: true,
                        description: 'Indicates which languages the client is able to understand.'
                    }
                ],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/PageView',
                            },
                        },
                    },
                    required: true
                },
                responses: {
                    '200': {
                        description: 'New Page View created.',
                    },
                    '500': {
                        description: 'Missing required parameters.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Error',
                                },
                                example: {
                                    message: 'ValidationError: PageView validation failed: host: Path `host` is required.'
                                },
                            },
                        },
                    },
                },
            },
        }
    },
    components: {
        schemas: {
            nodestatus: {
                type: 'string',
                description: 'Node.js server status.',
                example: 'ok',
            },
            mongostatus: {
                type: 'string',
                description: 'Mongoose/MongoDB connection status.',
                example: 'nok',
            },
            StatusReport: {
                type: 'object',
                properties: {
                    nodestatus: {
                        $ref: '#/components/schemas/nodestatus',
                    },
                    mongostatus: {
                        $ref: '#/components/schemas/mongostatus',
                    }
                },
            },
            originheader: {
                type: 'string',
                description: 'Indicates where a request originates from.',
                example: 'http://awebsite.com'
            },
            aclheader: {
                type: 'string',
                description: 'Indicates where a request originates from.',
                example: 'fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5'
            },
            host: {
                type: 'string',
                description: 'Host part of the URL.',
                example: 'asta86.gitlab.io',
                required: true
            },
            path: {
                type: 'string',
                description: 'Path section of the URL.',
                example: '/about.html',
                required: true
            },
            ip: {
                type: 'string',
                description: 'IP address of the origin host of the Request.',
                example: '127.0.0.1'
            },
            PageView: {
                type: 'object',
                properties: {
                    host: {
                        $ref: '#/components/schemas/host',
                    },
                    path: {
                        $ref: '#/components/schemas/path',
                    },
                    ip: {
                        $ref: '#/components/schemas/ip',
                    }
                }
            },
            Error: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                    },
                    statusCode: {
                        type: 'string',
                    },
                }
            }
        }
    }
};

module.exports = openApiDocumentation;
