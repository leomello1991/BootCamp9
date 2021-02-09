import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt'
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import Notification from '../schemas/Notification';

import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';


class AppointmentController{
  async store(req, res){
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required()
    })
    if(!(await schema.isValid(req.body))){
      return res.status(400).json({error: 'campos invalidos'})
    }

    const {provider_id, date} = req.body

    /*
    Check se o provider_id é provider
    */

    const isProvider = await User.findOne({
      where:{
        id: provider_id, provider:true
      },
    });

    if(!isProvider){
      return res.status(401).json({error: 'Voce somente pode criar agendamento com funcionarios'})
    }

    if(req.userId === provider_id){
      return res.status(400).json({error: 'não é possivel marcar agendamento consigo mesmo'})
    }

    const hourStart = startOfHour(parseISO(date));

    if(isBefore(hourStart, new Date())){
      return res.status(400).json({error: 'Datas anteriores não é permitida'})
    }

    const horarioDisponivel = await Appointment.findOne({
      where:{
        provider_id,
        canceled_at: null,
        date: hourStart
      }
    })

    if(horarioDisponivel){
      return res.status(400).json({error: 'horario ja está marcado'})
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date: hourStart,
    });

    /*Notificar usuario usando MongoDB e mongoose*/

    const user = await User.findByPk(req.userId)

    const formatedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às' H:mm'h' ",
      { locale: pt}
      )

      await Notification.create({
        content: `Novo agendamento de ${user.name} para  ${formatedDate}`,
        user: provider_id
      })


      return res.status(200).json(appointment)
    }

    async index(req, res){
      const { page } = req.query

      const appointments = await Appointment.findAll({
        where:{
          user_id: req.userId,
          canceled_at: null,
        },
        order:['date'],
        attributes:['id', 'date', 'past','cancelable'],
        limit: 20,
        offset: (page - 1) * 20
        ,      include:[
          {
            model: User,
            as: 'provider',
            attributes:['id', 'name', 'email'],
            include:[
              {
                model: File,
                as: 'avatar',
                attributes:['id','path', 'url'],
              }
            ]
          }
        ]
      })
      return res.status(200).json(appointments)
    }

    async delete(req, res){
      const appointment = await Appointment.findByPk(req.params.id,{
        include:[
          {
            model: User,
            as: 'provider',
            attributes:['name', 'email'],
          },
          {
            model: User,
            as: 'user',
            attributes:['name'],
          }
        ],
      });

      if(appointment.user_id !== req.userId){
        return res.status(401).json({error: 'somente o dono do agendamento pode cancela-lo'})
      }

      const dateWithSub = subHours(appointment.date, 2);

      if(isBefore(dateWithSub, new Date())){
        return res.status(401).json({error: 'Só é permitido o cancelamento com no minimo 2 horas de antecedencia'})
      }

      appointment.canceled_at = new Date();

      await appointment.save();

      await Queue.add(CancellationMail.key,{
        appointment,

      })

      return res.status(200).json(appointment)
    }
  }

  export default new AppointmentController()
