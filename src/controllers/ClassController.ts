import db from '../database/connection'
import convertHourToMinutes from '../utils/convertHourToMinutes'

import { Request, Response } from "express"

interface ScheduleItem {
    week_day: number
    from: string
    to: string
}

export default class ClassController {
    async index(req: Request, res: Response) {
        const filters = req.query

        if (!filters.subject || !filters.week_day || !filters.time) {
            return res.status(400).json({
                error: 'Missing filter parameters'
            })
        }

        const subject = filters.subject as string
        const week_day = filters.week_day as string
        const time = filters.time as string

        const timeInMinutes = convertHourToMinutes(time)

        const classes = await db('class')
        .where('class.subject', '=', subject)
            .whereExists(function() {
                this.select('class_schedule.*')
                    .from ('class_schedule')
                    .whereRaw('`class_schedule`.`class_id` = `class`.`id`')
                    .whereRaw('`class_schedule`.`week_day` = ??', [Number(week_day)])
                    .whereRaw('`class_schedule`.`from` <= ??',[timeInMinutes])
                    .whereRaw('`class_schedule`.`to` >= ??',[timeInMinutes])
            })
            .join('user', 'class.user_id', '=', 'user.id')
            .select(['class.*', 'user.*'])
        
        res.json(classes)
    }
    async create(req: Request, res: Response) {
        const { name, avatar, whatsapp, bio, subject, cost, schedule }= req.body
        
        const trx = await db.transaction()
    
        try {
            const lastUserIds = await trx('user').insert({
                name, avatar, bio, whatsapp
            })
            const user_id = lastUserIds[0]
        
            const lastClassIds = await trx('class').insert({
                subject, cost, user_id
            })
            const class_id = lastClassIds[0]
        
            const classSchedule = schedule.map((item: ScheduleItem) => {
                return {
                    class_id,
                    week_day: item.week_day,
                    from: convertHourToMinutes(item.from),
                    to: convertHourToMinutes(item.to)
                }
            })
            await trx('class_schedule').insert(classSchedule)
        
            await trx.commit()
        
            return res.status(201).send()
        } catch(err) {
            await trx.rollback()
    
            return res.status(400).json({
                error: 'Unexpected error while creating new class'
            })
        }
    }
}