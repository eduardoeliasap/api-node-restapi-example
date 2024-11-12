import 'dotenv/config'
import { env } from './env'
import { knex as setupKnex, Knex } from 'knex'

export const config: Knex.Config = {
    client: env.DATABASE_CLIENT,
    connection: env.DATABASE_CLIENT === 'sqlite' 
        ? {
            filename: env.DATABASE_URL
        } : {
            host: env.DATABASE_URL,
            port: env.DATABASE_PORT,
            database: env.DATABASE_CLIENT,
            user: env.DATABASE_USER,
            password: env.DATABASE_PASSWORD,
            connectionTimeoutMillis: 3000,
            keepAlive: true,
            ssl: false,
        },
    useNullAsDefault: true,
    migrations: {
        extension: 'ts',
        directory: './db/migrations'
    }
}

export const knex = setupKnex(config)