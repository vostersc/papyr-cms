import React, { useState, useContext } from 'react';
import { NextPageContext } from 'next'
import axios from 'axios'
import _ from 'lodash'
import keys from '../../config/keys'
import storeContext from '../../context/storeContext'
import CreditCardForm from '../../components/CreditCardForm'
import Input from '../../components/Input'
import UserInfoForm from '../../components/UserInfoForm'
import Stripe from 'stripe';

type Props = {
  product: Product
}

const Checkout = (props: Props) => {

  const cartState = useContext(storeContext)

  let cart: Array<Product> = []
  let fromCart = false

  // Get the checkout item(s)
  if (props.product) {
    cart = [props.product]
  } else {
    cart = cartState.cart
    fromCart = true
  }

  const [orderNotes, setOrderNotes] = useState("")
  const [handleSubmitSuccess, setHandleSubmitSuccess] = useState<Function>(() => null)
  const [handleSubmitError, setHandleSubmitError] = useState<Function>(() => null)

  const handleCardSubmit = (source: Stripe.Source, setProcessing: Function, setValidation: Function) => {
    const errorFunction = () => {
      setProcessing(false)
      setValidation('Something went wrong.')
    }
    setHandleSubmitError(() => errorFunction)


    const successFunction = (formState: any) => {
      const additionalValues = {
        fromCart,
        source,
        notes: orderNotes,
        products: cart
      }

      const success = () => {
        setProcessing(false)
        setValidation('Your order has been sent!')
        if (fromCart) {
          cartState.clearCart()
        }
      }

      const error = (err: any) => {
        setProcessing(false)
        if (err.response) {
          setValidation(err.response.data.message)
        }
      }

      formState.submitForm(
        '/api/store/checkout',
        { success, error },
        false,
        additionalValues
      )
    }
    setHandleSubmitSuccess(() => successFunction)

    const userInfoForm = document.getElementById('userInfoForm')
    if (userInfoForm) userInfoForm.dispatchEvent(new Event('submit'))
  }

  const renderProductsList = () => {
    return _.map(cart, (product, i) => {
      return <p key={product._id + i.toString()}>{product.title}: ${product.price.toFixed(2)}</p>
    })
  }

  const renderTotalCost = () => {
    let totalCost = 0
    _.forEach(cart, product => totalCost += product.price)
    return <p className="u-margin-bottom-small">Total Cost: ${totalCost.toFixed(2)}</p>
  }

  return (
    <section className="checkout">
      <div className="checkout__container">

        <h2 className="heading-secondary">Checkout</h2>

        <UserInfoForm
          useSubmit={false}
          onSubmitSuccess={handleSubmitSuccess}
          onSubmitError={handleSubmitError}
        >
          <Input
            type="textarea"
            label="Additional notes about the order"
            name="orderNotes"
            value={orderNotes}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setOrderNotes(event.target.value)}
          />

          {renderProductsList()}
          <hr />
          {renderTotalCost()}

          <CreditCardForm onSubmit={handleCardSubmit} />
        </UserInfoForm>

      </div>
    </section>
  )
}


Checkout.getInitialProps = async ({ query }: NextPageContext) => {

  const rootUrl = keys.rootURL ? keys.rootURL : ''

  let product
  if (query.id) {
    const res = await axios.get(`${rootUrl}/api/store/products/${query.id}`)
    product = res.data
  }

  return { product }
}


export default Checkout
