import 'dotenv/config'
import fastify from 'fastify'
import { env } from './env';
import cookie from '@fastify/cookie'
import { transactiosnRoutes } from './routes/transactions';

const app = fastify()

app.register(cookie)

app.addHook('preHandler', async (request) => {
    console.log(`${request.method}${request.url}`);
})

app.register(transactiosnRoutes, {
    prefix: 'transact'
})

app.listen({
    port: env.PORT
}).then(() => {
    console.log('Server is runnig on port:', env.PORT);
    
})