require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors =  require('cors')
const app = express()
const Person = require('./models/person')
const { response } = require('express')

const mongoURI = process.env.MONGODB_URI

morgan.token("data", function getData(res) {
  return JSON.stringify(res.body);
});

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))
app.set("json spaces", 4);
app.use(cors())
app.use(express.static('build'))

const errorHandler = (error, request, reponse, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformed id'})
  }

  return response.status(500).send({ error: 'system failure'})
}

app.use(errorHandler)


app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(persons => {
    response.json(persons).end()
  })
  .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
  now = new Date()
  Person.find({}).then(persons => {
    response.send(`<p>Phonebook has info for ${persons.length} people.</p><p>${now.toUTCString()}</p>`).end()
  })
  .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  console.log("Trying to find id", request.params.id)
  Person.findById(request.params.id)
    .then(person => {
      response.json(person)
    })
    .catch(error => next(error))
}) 

app.delete('/api/persons/:id', (request, response, next) => {

  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.sendStatus(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body;
  const person = new Person({
    name: body.name,
    number: body.number
  });
  console.log("person: ", person)
  if (person.name === "" || person.number=="" || person.name === undefined || person.number === undefined) {
    response.json({ error: 'name or number is empty' }).end()
  }
  else if (Person.find({name: person.name}).length>0) {
    response.json({ error: 'name must be unique' })
  } else {
    person.save().then(savedPerson => {
      response.json(person).end()
    })
    .catch(error => next(error))
  }
})

app.put('/api/persons/:id', (request, response, next) => {
  console.log("put: ", request.body)
  Person.findByIdAndUpdate(request.params.id, {number: request.body.number})
  .then(result => {
    response.json(request.params).end()
  })
  .catch(error => next(error))

})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
