require('dotenv').config()
const express = require('express')
const sequelize = require('./db')
const models = require('./models/models')
const multer = require('multer')
const upload = multer({ dest: './static/' })
const PORT = process.env.PORT || 5000
const cors = require('cors')
const router = require('./routes/index')
const fs = require('fs')
// require('./service/scheduler');

const app = express()

app.use('/static', express.static('static'))
app.use(cors())

// app.post('/api/uploadFile', upload.single('static'), (req, res) => {
//     const fileType = req.file.mimetype.split('/')[1]
//     const newName = req.file.filename + '.' + fileType
//     fs.rename('./static/' + req.file.filename, './static/' + newName, () => {
//         res.send(newName)
//     })
// })



app.use(express.json())
app.use('/api', router)

const start = async () => {
    try {

        await sequelize.authenticate()
        await sequelize.sync()
        app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))

    } catch (e) { console.log(e); }
}

start()