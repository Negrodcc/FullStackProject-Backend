const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

//bring the url from a temporary env
const url = process.env.MONGODB_URI

console.log('connecting to the database')

mongoose.connect(url)
  .then(result => {
    console.log('succefuls: connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

//defining the schema
const personSchema = new mongoose.Schema({
    name : String,
    number : String,
})

personSchema.set('toJSON',{
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

//export only the constructor model (CLASS)
module.exports = mongoose.model('Person', personSchema)


