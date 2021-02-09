import jwt from 'jsonwebtoken'
import * as Yup from 'yup'

import User from '../../app/models/User'
import authConfig from '../../config/auth'

class SessionController{
  async store(req, res){
    const schema = Yup.object().shape({
      email: Yup.string().email().required(),
      password: Yup.string().required()
    });

    if(!(await schema.isValid(req.body))){
      return res.status(500).json({error: 'campos invalidos'})
    }

    const {email, password} = req.body

    const user = await User.findOne({where: {email}});

    if(!user){
      return res.status(401).json({error: 'Usuario nao existe'});
    }

    if(!(await user.checkPassword(password))){
      return res.status(401).json({error: 'senha nao esta correta'})
    }

    const{id, name} = user;

    return res.status(200).json({
      user:{
        id,
        email,
        name
      },
      token: jwt.sign({id}, authConfig.secret,{
        expiresIn: authConfig.expireIn,
      })
    })
  }

}

export default new SessionController()
