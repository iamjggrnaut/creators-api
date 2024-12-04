const { Room } = require('../models/models')

class RoomController {

    async getRoom(req, res) {
        const { id } = req.id
        const room = await Room.findOne({ where: { id } })
        return res.json({ room })
    }

    async getAllRooms(req, res) {
        const rooms = await Room.findAll()
        return res.json({ rooms })
    }

}


module.exports = new RoomController()