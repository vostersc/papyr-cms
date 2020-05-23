import _ from 'lodash'
import common from "../../../../utilities/serverContext/"
import Product from "../../../../models/product"
import User from "../../../../models/user"


const addToCart = async (productId, user) => {
  const product = await Product.findOne({ _id: productId })

  // If we are out of stock
  if (product.quantity <= 0) {
    throw new Error('This product is sold out.')
  }

  // If we have all available products in our cart
  if (_.filter(user.cart, inCart => product._id.equals(inCart._id)).length >= product.quantity) {
    throw new Error('You cannot buy more than what is available.')
  }

  user.cart.push(product)
  await User.findOneAndUpdate({ _id: user._id }, { cart: user.cart })

  return user.cart
}


const removeFromCart = async (productId, user) => {
  let removed = false
  const cart = _.filter(user.cart, product => {

    // If one has not been removed and it has the passed id, remove it
    if (product._id.equals(productId) && !removed) {
      removed = true
      return false
    }

    return true
  })

  await User.findOneAndUpdate({ _id: user._id }, { cart })

  return cart
}


export default async (req, res) => {

  const { user, settings } = await common(req, res)
  if (!user || (!user.isAdmin && !settings.enableStore)) {
    return res.status(403).send({ message: "You are not allowed to do that." })
  }

  if (req.method === 'PUT') {
    const cart = await addToCart(req.query.id, user)
    return res.status(200).send(cart)
  }


  if (req.method === 'DELETE') {
    const cart = await removeFromCart(req.query.id, user)
    return res.status(200).send(cart)
  }


  return res.status(404).send({ message: 'Page not found.' })
}
