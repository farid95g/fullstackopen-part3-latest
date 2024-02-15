const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const dbUrl = process.env.MONGODB_URI

console.log('CONNECTING TO DATABASE', dbUrl)

mongoose.connect(dbUrl)
    .then(() => console.log('SUCCESSFULLY CONNECTED TO DATABASE!'))
    .catch(error => console.log('FAILED TO CONNECT TO DATABASE', error.message))

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 3
    },
    number: {
        type: String,
        required: true,
        minLength: 8,
        validate: {
            validator: function(v) {
                return /^\d{2,3}-\d+$/.test(v)
            }
        }
    }
})

personSchema.set('toJSON', {
    transform: (_, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)