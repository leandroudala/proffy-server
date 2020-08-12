import { Request, Response, response } from 'express'
import db from '../database/connection'

export default class ConnectionController {
    async index(req: Request, res: Response) {
        const totalConnections = await db('connection').count('id as total')

        const {total} = totalConnections[0]

        return res.json({ total })
    }
    async create(req: Request, res: Response) {
        const {user_id} = req.body
        await db('connection').insert({
            user_id
        })

        return res.status(201).send()
    }
}