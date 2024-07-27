import { FastifySchema } from 'fastify';

export const registerUserSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['id', 'first_name', 'language_code'],
    properties: {
      id: { type: 'number' },
      first_name: { type: 'string' },
      last_name: { type: 'string' },
      language_code: { type: 'string' },
    },
  },
};

export const addCoinsSchema: FastifySchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    required: ['id'],
  },
  body: {
    type: 'object',
    properties: {
      coins: { type: 'number' },
    },
    required: ['coins'],
  },
};
