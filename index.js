require('dotenv').config()
const express = require('express')
const sequelize = require('./db')
const PORT = process.env.PORT || 5000
const cors = require('cors')
const router = require('./routes/index')
const errorHandling = require('./middleware/ErrorHandlingMiddleware')
const createAdmin = require('./utils/utils')

const { Room } = require('./models/models')

const app = express()

app.use(cors())


app.use(express.json())
app.use('/api', router)
app.use(errorHandling)

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()

        await createAdmin();
        await createRoom()

        app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))

    } catch (e) { console.log(e); }
}

start()


const createRoom = async () => {
    const names = ['genesis', 'nova', 'echo', 'chrono', 'pantheon']
    for (let name in names) {
        const room = await Room.findOne({ where: { name: names[name] } })
        if (!room) {
            await Room.create({
                name: names[name],
                description: '',
            })
            console.log('Room created');

        }
        else {
            console.log('Room already exists');

        }
    }
}