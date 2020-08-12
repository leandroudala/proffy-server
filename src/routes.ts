import express from 'express'
import ClassController from './controllers/ClassController'
import ConnectionController from './controllers/ConnectionController'

const routes = express.Router()

const connectionController = new ConnectionController()
const classController = new ClassController()

routes.get('/', (req, res) => {
    return res.json({message: 'Hello, World!'})
})

routes.get('/class', classController.index)
routes.post('/class', classController.create)

routes.get('/connection', connectionController.index)
routes.post('/connection', connectionController.create)

export default routes