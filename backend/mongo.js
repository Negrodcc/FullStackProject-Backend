const mongoose = require('mongoose')
if (process.argv.length < 3) {
  console.log('password is not been given')
  process.exit(1)
}

else if (process.argv.length > 5) {
  console.log('so many arguments, perphabs you are not casting name field to string type ')
  process.exit(1)
}

//encodeURIComponent fixs special caracteres, like @, ^,´ etc
const password = encodeURIComponent(process.argv[2])

const url = `mongodb+srv://negrodcc:${password}@fullstack.r7yq8.mongodb.net/Phonebook?retryWrites=true&w=majority&appName=FullStack`

mongoose.set('strictQuery',false) //to allow missing fields in the querys, for example querys using in the find method
mongoose.connect(url)

//schema
const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

//class Person, which have the schema and allows us to create objects
const Person = mongoose.model('Person', personSchema)

//if the command in the shell is node mongo.js <password> then we must display all the persons
if (process.argv.length === 3) {
  Person.find({})
    .then(result => {
      result.forEach(person => {
        console.log(person)
      })
      //after log all the persons, we close the connection
      mongoose.connection.close()
      //close the program succesful
      process.exit(0)
    })
}



//here we have 5 arguments
if (process.argv.length === 5) {
  const person = new Person({
    name: (process.argv[3]),
    number: (process.argv[4]),
  })

  person.save().then(() => {
    console.log(`added ${person.name} number ${person.number} to phonebook`)
    mongoose.connection.close()
  })
}

