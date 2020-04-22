const pkgData = require('../package.json');

const openApiDocumentation = {
  openapi: '3.0.1',
  info: {
    version: pkgData.version,
    title: pkgData.name,
    description: pkgData.description,
    termsOfService: '',
    contact: {
      name: pkgData.author.replace(/ .+/, ''),
      email: pkgData.author.split(' ')[1].replace(/<|>/g, ''),
      url: pkgData.author.split(' ')[2].replace(/\(|\)/g, ''),
    },
    license: {
      name: pkgData.license,
      url: 'https://spdx.org/licenses/' + pkgData.license + '.html#licenseText',
    },
  },
  servers: [
    {
      url: 'http://localhost:8080',
      description: 'Local server',
    },
    {
      url: pkgData.homepage,
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
            description: 'Status report object generated and JSON response sent.',
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
        description: 'Get one or more Page Views at once. If no filters are provided all records in the database are retrieved.',
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
            description: 'Records were successfully retrieved from the database.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PageViewFinal',
                },
              },
            },
          },
          '400': {
            description: 'Missing or extraneous parameters in the query string.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
                example: {
                  message: 'Invalid search query.'
                },
              },
            },
          },
          '404': {
            description: 'No results found.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
                example: {
                  message: 'No records were found in the database matching the criteria provided.'
                },
              },
            },
          }
        },
      },
    },
    '/api/pageview': {
      get: {
        tags: ['CRUD operations'],
        description: 'Get a specific Page View record from the database.',
        operationId: 'getPageView',
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
            name: 'id',
            in: 'query',
            schema: {
              type: 'string'
            },
            required: true,
            description: 'MongoDB ObjectID of the record.',
            example: '5e891bbdf552340004a8d56f'
          }
        ],
        responses: {
          '200': {
            description: 'Page View found.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PageViewFinal',
                },
              },
            },
          },
          '400': {
            description: 'Missing id parameter or extraneous parameters in the query string.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
                example: {
                  message: 'Invalid search query.'
                },
              },
            },
          },
          '404': {
            description: 'Non existent ObjectID.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
                example: {
                  message: 'No records were found in the database matching the criteria provided.'
                },
              },
            },
          }
        },
      },
      put: {
        tags: ['CRUD operations'],
        description: 'Update a specific Page View record. Only fields with new values need to be provided.',
        operationId: 'PageViewFinal',
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
            name: 'id',
            in: 'query',
            schema: {
              type: 'string'
            },
            required: true,
            description: 'MongoDB ObjectID of the record.',
            example: '5e891bbdf552340004a8d56f'
          }
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/PageViewFinal',
              },
            },
          },
          required: true
        },
        responses: {
          '200': {
            description: 'Page View found and updated.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PageViewFinal',
                },
              },
            },
          },
          '400': {
            description: 'Missing id parameter or extraneous parameters in the query string.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
                example: {
                  message: 'Invalid search query.'
                },
              },
            },
          },
          '404': {
            description: 'Non existent ObjectID.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
                example: {
                  message: 'No records were found in the database matching the criteria provided.'
                },
              },
            },
          }
        },
      },
      delete: {
        tags: ['CRUD operations'],
        description: 'Delete a specific Page View record from the database.',
        operationId: 'delPageView',
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
            name: 'id',
            in: 'query',
            schema: {
              type: 'string'
            },
            required: true,
            description: 'MongoDB ObjectID of the record.',
            example: '5e891bbdf552340004a8d56f'
          }
        ],
        responses: {
          '200': {
            description: 'Record found and removed.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PageViewFinal',
                },
              },
            },
          },
          '400': {
            description: 'Missing id parameter or extraneous parameters in the query string.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
                example: {
                  message: 'Invalid search query.'
                },
              },
            },
          },
          '404': {
            description: 'Non existent ObjectID.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
                example: {
                  message: 'No records were found in the database matching the criteria provided.'
                },
              },
            },
          }
        },
      }
    },
    '/api/newpageview': {
      post: {
        tags: ['CRUD operations'],
        description: 'Create a new Page View event and store it in the database.',
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
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PageViewFinal',
                },
              },
            }
          },
          '500': {
            description: 'Required parameters missing in the request body.',
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
        description: 'Accepted languages request header.',
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
      country: {
        type: 'string',
        description: '2-letter country code of the origin IP address.',
        example: 'de'
      },
      language: {
        type: 'string',
        description: '2-letter language code.',
        example: 'fr'
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
      PageViewFinal: {
        type: 'object',
        properties: {
          host: {
            $ref: '#/components/schemas/host',
          },
          path: {
            $ref: '#/components/schemas/path',
          },
          language: {
            $ref: '#/components/schemas/language',
          },
          country: {
            $ref: '#/components/schemas/country',
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
