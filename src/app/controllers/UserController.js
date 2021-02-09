import User from '../../app/models/User'

import * as Yup from 'yup'

class UserController{
  async store(req, res){
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().required().min(6),
    });

    if(!(await schema.isValid(req.body))){
      return res.status(500).json({error: 'campos invalidos'})
    }

    const findUser = await User.findOne({where: {email: req.body.email}})

    if(findUser){
      return res.status(400).json({message: 'Usuario ja existe'})
    }
    const {id, email, name, provider } = await User.create(req.body)

    return res.status(200).json({
      id,
      email,
      name,
      provider
    })
  };

  async update(req, res){
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string().min(6).when('oldPassword', (oldPassword, field) =>
        oldPassword ? field.required(): field
      ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      )
    });

    if(!(await schema.isValid(req.body))){
      return res.status(500).json({error: 'campos invalidos'})
    }

    console.log(req.body)
    const {email, oldPassword} = req.body

    const user = await User.findByPk(req.userId)

    if(email && email !== user.email){
      const findUser = await User.findOne({where: {email}})

      if(findUser){
        return res.status(400).json({message: 'Usuario ja existe'})
      }
    }

    if(oldPassword && !(await user.checkPassword(oldPassword))){
      return res.status(401).json({error: 'senha diferente da atual'})
    }

    const {id, name, provider} = await user.update(req.body)


    return res.status(200).json({
      id,
      name,
      email,
      provider
    })
  }

}

export default new UserController();
