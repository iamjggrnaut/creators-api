const { Sale } = require('../models/models')

class SaleController {

    async getSales(req, res) {
        let { id } = req.params
        let { brandName } = req.query

        const data = await Sale.findOne({ where: { userId: id, brandName } })
        return (res.json(data))
    }

}

module.exports = new SaleController()