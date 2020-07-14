const express = require('express')
const morgan = require("morgan")
const app = express()

morgan.token("data", function getData(res) {
  return JSON.stringify(res.body);
});


app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))
app.set("json spaces", 4);

let persons = [
    { 
      "name": "Arto Hellas", 
      "number": "040-123456",
      "id": 1
    },
    { 
      "name": "Ada Lovelace", 
      "number": "39-44-5323523",
      "id": 2
    },
    { 
      "name": "Dan Abramov", 
      "number": "12-43-234345",
      "id": 3
    },
    { 
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122",
      "id": 4
    }
  ]

app.get('/api/persons', (request, response, next) => {
    response.send(persons)
})

app.get('/info', (request, response) => {
  now = new Date()
  response.send(`<p>Phonebook has info for ${persons.length} people.</p><p>${now.toUTCString()}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => (person.id === id))
  console.log("Trying to find id", id, person)
  if (person===undefined) {
    response.sendStatus(404).end()
  } else {
    response.json(person)
  }
}) 

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)
  response.sendStatus(204).end()
})

app.post('/api/persons', (request, response) => {
  const body = request.body;
  const person = {
    name: body.name,
    number: body.number,
    id: Math.floor(Math.random()*1000000)
  };
  console.log("person: ", person)
  if (person.name === "" || person.number=="" || person.name === undefined || person.number === undefined) {
    response.json({ error: 'name or number is empty' }).end()
  }
  else if (persons.filter(p => p.name === person.name).length > 0) {
    response.json({ error: 'name must be unique' })
  } else {
    persons =  persons.concat([person])
    response.json(person).end()
    }
})


const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})