const mongoose = require('mongoose')

const apiSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: String,
    description: String,
    code: String
})

module.exports = mongoose.model( 'apis', apiSchema )