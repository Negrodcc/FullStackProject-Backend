require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(express.static('dist'))
//use cors
app.use(cors())

//to be available to recieved data in JSON format and parser automaticly in js objects 
app.use(express.json())

//we use this middlerware after express.json(), because if we did it before, then req.body would be undefined
// New token type bring the data from the POST method
morgan.token('personData', (req) => JSON.stringify(req.body));
// Combine manually the tiny format with the token format
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :personData ',{
    skip: (req, res) => req.method !== 'POST', //only for POST
}));

//and to all other methods, we use the normal tiny format, except for POST
app.use(morgan('tiny',{
    skip: (req, res) => req.method === 'POST', //only for POST
}))

app.get('/', (request, response) => {
  response.send('<h1>Phonebook</h1>')
})

app.get('/api/persons', (request, response) => {
    Person.find({})
      .then(persons => {
        response.json(persons)
      })
  })


app.get('/info', (request, response) => {
    //like the request don't have the time, we must to check it now
    const time = new Date().toString();
    Person.find({})
      .then(allData => {
        const htmlResponse = `
        <div>
          <p>Phonebook has information for ${allData.length} people!</p>
          <p>${time}</p>
        </div>
        `
        response.send(htmlResponse)
      })
 })

app.get('/api/persons/:id', (request, response) => {
  console.log(`the id is : ${request.params.id}`)
    Person.findById(request.params.id)
      .then(Person => {
        response.json(Person)
      })
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
      .then(deletedPerson => {
        console.log("the deteled person is : ", deletedPerson)
        response.status(204).end()
      })
      .catch(error => next(error))
})


app.post('/api/persons/', (request, response, next) => {
    const data = request.body //thanks to app.use(express.json())
    if (!data.name) {
        return response.status(400).json({ 
            error: 'name missing' 
          })
    }
    if (!data.number) {
        return response.status(400).json({ 
            error: 'number missing' 
          })
    }

    //check if the name its already in the database, then if the number is a new one, we update it
    Person.findOne({name: data.name})
      .then(dataSameName => {
        console.log("sameName is : ", dataSameName)
        //if sameName exists
        if (dataSameName) {
          //if the number is the same (all the data is the same)
          if (dataSameName.number === data.number) {
            console.log("duplicated data")
            response.status(400).end()
          }
          //if not, we updated the number
          else {
            const newPerson = {
              name: dataSameName.name,
              number: data.number,
            }
            Person.findByIdAndUpdate(dataSameName.id, newPerson, { new: true, runValidators: true, context: 'query' })
              .then(updatedPerson => {
                console.log("updated person is now : ", updatedPerson)
                response.json(updatedPerson)
              })
              .catch(error => next(error))
          }
        }
        //if its a new name, then we save the person
        else {
          const newPerson = new Person({
            name: data.name,
            number: data.number,
          })
          newPerson.save()
            .then(savedPerson => {
              response.json(savedPerson)
            })
            .catch(error => next(error)) //send the error when savedPerson can't be saved does not comply with restrictions
        }

      })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }

  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})