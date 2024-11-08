import 'dotenv/config'
import fastify from 'fastify'
import { knex } from './database'
import * as crypto from "crypto";
import { env } from './env';

const app = fastify()

app.get('/hello', async () => {
    const transaction = await knex('transactions').select('*')

    return transaction
})

app.post('/hello', async () => {
    const transaction = await knex('transactions').insert({
        id: crypto.randomUUID(),
        title: 'Transacao test',
        amount: 1000
    }).returning('*')

    return transaction
})

app.listen({
    port: env.PORT
}).then(() => {
    console.log('Server is runnig on port:', env.PORT);
    
})