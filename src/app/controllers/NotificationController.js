import User from '../models/User'
import Notification from '../schemas/Notification'

class NotificationController{
  async index(req, res){
    const checkUserProvider = await User.findOne({
      where:{
        id: req.userId,
        provider: true
      }
    })

    if(!checkUserProvider){
      return res.status(401).json({error: 'Somente Funcionarios podem podem receber notificação'})
    }

    const notifications = await Notification.find({
      user: req.userId,
    })
    .sort({createdAt: 'desc'})
    .limit(20);


    return res.json(notifications)
  }
  async update(req, res){
    /*Metodo tradicional onde vc passa o id no param e so recupera do banco para depois alterar

    >>>>>  const notification = await Notification.findById(req.params.id)

    */

    /* metod que busca e ja altera o dado do banco */
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true }, //altera o campo
      { new: true} //retorna a notificação.. se nao passar ele so atualiza
      )
      return res.status(200).json(notification)
    }
  }


  export default new NotificationController()
