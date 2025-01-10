const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
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

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
  response.send('<h1>Phonebook</h1>')
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
  })


app.get('/info', (request, response) => {
    //like the request don't have the time, we must to check it now
    const time = new Date().toString();
    const htmlResponse = `
    <div>
      <p>Phonebook has information for ${persons.length} people!</p>
      <p>${time}</p>
    </div>
    `
    response.send(htmlResponse)
 })

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(p => p.id == id)
    if (person) {
        response.json(person)
    }
    else {
        response.status(400).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(p => p.id == id)
    //we check if that id's person exists
    if (person) {
        persons = persons.filter(n => n.id != id)
        response.status(204).end()
    }
    else {
        //if does'nt exists, we send a 400 code error
        response.status(400).end()
    }
})

const getId = () => {
    let bigRandomInt = Math.floor(Math.random() * 1e6);
    return bigRandomInt
}

app.post('/api/persons/', (request, response) => {
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
    //if the person has correctly the two fields, then we check that the name hasn't been added already
    const duplicated = persons.find(person => person.name === data.name)
    if (duplicated) {
        return response.status(400).json({ 
            error: 'name must be unique' 
        })
    }
    //(notice that all if statements have a return, therefore we dont need a else statement)
    //we pass all the requeriments, so we add the new person
    const newPerson = {...data, id: getId()} //add the id field
    persons = persons.concat(newPerson)
    response.json(newPerson)


    

})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})