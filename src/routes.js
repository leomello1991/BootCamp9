import { Router } from 'express';
import multer from 'multer'

import multerConfig from './config/multer'
import authConfig from './app/middlewares/auth'

import userController from './app/controllers/UserController'
import sessionController from './app/controllers/SessionController'
import fileController from './app/controllers/FileController'
import providerController from './app/controllers/ProviderController'
import appointmentController from './app/controllers/AppointmentController'
import scheduleController from './app/controllers/ScheduleController'
import notificationController from './app/controllers/NotificationController'
import availableController from './app/controllers/AvailableController'


const routes = new Router();
const upload = multer(multerConfig)

/* rotas sem autenticação*/

routes.post('/users', userController.store)
routes.post('/sessions', sessionController.store)

/*Rotas com autenticação*/

routes.use(authConfig)

/* Users */
//routes.put('/users', userController.update)
//routes.get('/users', userController.index)
//routes.delete('/users', userController.delete)

/*Appointment */

routes.post('/appointments', appointmentController.store)
//routes.put('/appointments', appointmentController.update)
routes.get('/appointments', appointmentController.index)
routes.delete('/appointments/:id', appointmentController.delete)

/*Agenda Prestador */

routes.get('/schedule', scheduleController.index)


/*Providers */

routes.get('/providers', providerController.index)
routes.get('/providers/:providerId/available', availableController.index)

/* Noticicações */

routes.get('/notifications', notificationController.index)
routes.put('/notifications/:id', notificationController.update)

/*Files */
routes.post('/files', upload.single('file'), fileController.store)


export default routes;
