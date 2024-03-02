const { Order } = require('../models/models')

class OrderController {

    async getOrders(req, res) {
        let { id } = req.params
        let { brandName } = req.query

        const data = await Order.findOne({ where: { userId: id, brandName } })
        return (res.json(data))
    }

}

module.exports = new OrderController()