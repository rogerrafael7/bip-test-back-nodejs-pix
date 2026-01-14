import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PIX Orchestrator API',
      version: '2.0.0',
      description: 'API para consulta de participantes PIX do Banco Central do Brasil',
      contact: {
        name: 'PIX Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    paths: {
      '/pix/participants/{ispb}': {
        get: {
          summary: 'Busca participante PIX por ISPB',
          tags: ['PIX'],
          parameters: [
            {
              name: 'ispb',
              in: 'path',
              required: true,
              description: 'Código ISPB do participante (8 dígitos)',
              schema: { type: 'string', example: '00000000' },
            },
          ],
          responses: {
            200: {
              description: 'Participante encontrado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PixParticipant' },
                },
              },
            },
            400: {
              description: 'ISPB inválido',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                },
              },
            },
            404: {
              description: 'Participante não encontrado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                },
              },
            },
            503: {
              description: 'Serviço temporariamente indisponível',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        PixParticipant: {
          type: 'object',
          properties: {
            ispb: { type: 'string', example: '00000000' },
            nome: { type: 'string', example: 'BANCO DO BRASIL S.A.' },
            nome_reduzido: { type: 'string', example: 'BCO DO BRASIL S.A.' },
            modalidade_participacao: { type: 'string', example: 'PISP' },
            tipo_participacao: { type: 'string', example: 'DIRETO' },
            inicio_operacao: { type: 'string', example: '2020-11-16' },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            code: { type: 'string' },
            details: { type: 'string' },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
