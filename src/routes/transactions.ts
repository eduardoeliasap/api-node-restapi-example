import { FastifyInstance } from "fastify";
import { knex } from "../database"
import * as crypto from "crypto";
import { z } from 'zod'
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";

export async function transactiosnRoutes(app: FastifyInstance) {
    app.get('/', {
        preHandler: [checkSessionIdExists]
    } , async (request) => {
        const { sessionId } = request.cookies
        
        const transactions = await knex('transactions').where('session_id', sessionId).select('*')
    
        return { 
            transactions, }
    })

    app.get('/:id', {
        preHandler: [checkSessionIdExists]
    }, async (request) => {
        const getTransactionSchema = z.object({
            id: z.string().uuid()
        })

        const { id } = getTransactionSchema.parse(request.params)

        const transaction = await knex('transactions').where('id', id).first()
    
        return { transaction }
    })

    app.get('/summary', {
        preHandler: [checkSessionIdExists]
    }, async () => {
        const summary = await knex('transactions').sum('amount', { as: 'amount' }).first()

        return { summary }
    })

    app.post('/', async (request, reply) => {
        const createTransactionBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['credit', 'debit'])
        })

        const { title, amount, type } = createTransactionBodySchema.parse(request.body)

        let sessionId = request.cookies.sessionId

        if (!sessionId) {
            sessionId = crypto.randomUUID()

            reply.cookie('sessionId', sessionId, {
                path: '/', // Indicates that any backend route can access these cookies
                maxAge: 60 * 60 * 24 * 7 // 7 days
            })
        }

        await knex('transactions').insert({
            id: crypto.randomUUID(),
            title,
            amount: type === 'credit' ? amount : amount * -1,
            session_id: sessionId
        }).returning('*')
    
        return reply.status(201).send('Transaction succeeded!')
    })
}