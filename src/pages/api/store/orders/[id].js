import serverContext from "@/serverContext"
import Order from "@/models/order"


const updateOrder = async (id, body) => {
  await Order.findOneAndUpdate({ _id: id }, { shipped: body.shipped })
  return await Order.findOne({ _id: id }).lean()
}


const deleteOrder = async (id) => {
  await Order.findByIdAndDelete(id)
  return 'order deleted'
}


export default async (req, res) => {

  const { user, done } = await serverContext(req, res)
  if (!user || !user.isAdmin) {
    return await done(403, { message: "You are not allowed to do that." })
  }

  if (req.method === 'PUT') {
    const order = await updateOrder(req.query.id, req.body)
    return await done(200, order)
  }


  if (req.method === 'DELETE') {
    const message = await deleteOrder(req.query.id)
    return await done(200, message)
  }

  return await done(404, { message: 'Page not found.' })
}
