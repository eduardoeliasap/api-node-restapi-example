import { it, beforeAll, afterAll, describe, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { beforeEach } from 'node:test'
import { execSync } from 'node:child_process'

describe('Transactions routes', () => {
    beforeAll(async () => {
        await app.ready()
    })
    
    afterAll(async () => {
        await app.close()
    })

    beforeEach(async () => {
        execSync('npm run knex migrate:rollback --all')
        execSync('npm run knex migrate:latest')
    })
    
    it('shoud be able to create a new transaction', async() => {
        await request(app.server).post('/transact').send({
            title: 'New transaction',
            amount: 5000,
            type: 'credit'
        }).expect(201)
    })

    it('shoud be able to list all transactions', async () => {
        const createTransactionResponse = await request(app.server).post('/transact').send({
            title: 'New transaction',
            amount: 5000,
            type: 'credit'
        }).expect(201)

        const cookies = createTransactionResponse.get('Set-Cookie')

        const listTrasactionResponse =  await request(app.server)
            .get('/transact')
            .set('Cookie', cookies)
            .expect(200)

        expect(listTrasactionResponse.body.transactions).toEqual([
            expect.objectContaining({
                title: 'New transaction',
                amount: 5000
            })
        ])
        
    })

    it('shoud be able to get an specific transaction', async () => {
        const createTransactionResponse = await request(app.server).post('/transact').send({
            title: 'New transaction',
            amount: 5000,
            type: 'credit'
        }).expect(201)

        const cookies = createTransactionResponse.get('Set-Cookie')

        const listTrasactionResponse =  await request(app.server)
            .get('/transact')
            .set('Cookie', cookies)
            .expect(200)

        const transactionId = listTrasactionResponse.body.transactions[0].id

        const getTransactionResponse = await request(app.server)
            .get(`/transact/${transactionId}`)
            .set('Cookie', cookies)
            .expect(200)

        expect(getTransactionResponse.body.transaction).toEqual(
            expect.objectContaining({
                amount: 5000,
                created_at: expect.any(String),
                id: expect.any(String),
                session_id: expect.any(String),
                title: 'New transaction',                
            })
        )
        
    })

    it('shoud be able to get summary', async () => {
        const createCreditTransactionResponse = await request(app.server).post('/transact').send({
            title: 'New transaction',
            amount: 5000,
            type: 'credit'
        }).expect(201)        

        await request(app.server).post('/transact').send({
            title: 'New transaction',
            amount: 3000,
            type: 'debit'
        }).expect(201)

        const cookies = createCreditTransactionResponse.get('Set-Cookie')        

        const summaryResponse =  await request(app.server)
            .get('/transact/summary')
            .set('Cookie', cookies)
            .expect(200)
        
        expect(summaryResponse.body.summary.amount).toBeGreaterThan(0)
    })
})

