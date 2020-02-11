import connect from 'next-connect'
import common from '../../../middleware/common/'
import Settings from '../../../models/settings'


const handler = connect()
handler.use(common)


handler.get((req, res) => {
  return res.status(200).send(res.locals.settings || {})
})


handler.post(async (req, res) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).send({ message: 'You are not allowed to do that.' })
  }

  const settings = await Settings.find()

  for (const setting of settings) {
    for (const key in req.body) {
      if (typeof setting.options[key] !== 'undefined') {
        setting.options[key] = req.body[key]
        await Settings.findOneAndUpdate({ _id: setting._id }, setting)
      }
    }
  }

  return res.status(200).send(req.body)
})


export default (req, res) => handler.apply(req, res)
