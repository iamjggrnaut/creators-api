const { Booking } = require('../models/models')
const { User } = require('../models/models')

class BookingController {

    async getUserBookings(req, res) {
        const { id } = req.params
        const bookings = await Booking.findAll({ where: { userId: id } })
        return res.json({ bookings })
    }

    async getRoomBookings(req, res) {
        const { id } = req.params
        const bookings = await Booking.findAll({ where: { roomId: id } })
        return res.json({ bookings })
    }

    async getRoomBookingsExtended(req, res) {
        const bookings = await Booking.findAll()
        if (bookings && bookings.length) {
            for (let booking in bookings) {
                let email = bookings[booking].email
                let user = await User.findOne({ where: { email: email } })
                bookings[booking].dataValues['user'] = user
            }
        }
        return res.json({ bookings })
    }

    async createBooking(req, res) {
        const { bookings, email, userId } = req.body
        const user = await User.findOne({ where: { email } })
        try {
            for (let i in bookings) {
                console.log(bookings[i]);

                await Booking.create({
                    date: bookings[i].date,
                    hour: bookings[i].hour,
                    roomId: bookings[i].roomId,
                    email: email,
                    userData: user,
                    userId: userId
                })
                console.log('booking created');

            }
        } catch (err) {
            console.log(err);
        }
    }

    async createFastBooking(req, res) {
        const { bookings, userData } = req.body
        try {
            for (let i in bookings) {
                console.log(bookings[i]);

                await Booking.create({
                    date: bookings[i].date,
                    hour: bookings[i].hour,
                    roomId: bookings[i].roomId,
                    userData: userData,
                    email: userData.email
                })
                console.log('booking created');

            }
            return res.json({ success: 'success' })
        } catch (err) {
            console.log(err);
        }
    }

}

module.exports = new BookingController()