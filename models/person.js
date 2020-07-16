const mongoose = require('mongoose')

const mongoURI = process.env.MONGODB_URI

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true})
    .then(result => {
        console.log('Connected to db succeed.')
    }).catch((error) => {
        console.log('Connection to db failed: ', error.message)
    })

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        uniqueCaseInsensitive: true,
        minlength: 3
    },
    number: { type: String, required: true, minlength: 8 }
    });


personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject.id
        delete returnedObject.__v
    }
})


module.exports = mongoose.model('Person', personSchema)