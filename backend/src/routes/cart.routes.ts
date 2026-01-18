import Router from "express"

import { addToCart, getCartByUserId, removeFromCart, clearCart  ,updateCartStatus} from "../conttrolers/cart.contllors"
const cartRouter =  Router()

cartRouter.post('/add', addToCart)
cartRouter.get('/:userid', getCartByUserId)
cartRouter.post('/remove', removeFromCart)
cartRouter.post('/clear', clearCart)
cartRouter.patch('/update-status', updateCartStatus)

export default cartRouter

