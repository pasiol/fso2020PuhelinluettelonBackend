require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors =  require('cors')
const app = express()
const Person = require('./models/person')

morgan.token('data', function getData(res) {
    return JSON.stringify(res.body)
})

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))
app.set('json spaces', 4)
app.use(cors())
app.use(express.static('build'))

app.get('/api/persons', (request, response, next) => {
    Person.find({}).then(persons => {
        response.json(persons).end()
    })
        .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
    const now = new Date()
    Person.find({}).then(persons => {
        response.send(`<p>Phonebook has info for ${persons.length} people.</p><p>${now.toUTCString()}</p>`).end()
    })
        .catch(error => next( error))
})

app.get('/api/persons/:id', (request, response, next) => {
    console.log('Trying to find id', request.params.id)
    Person.findById(request.params.id)
        .then(person => {
            response.json(person)
        })
        .catch(error => next(error))
}) 

app.delete('/api/persons/:id', (request, response, next) => {
    console.log('Trying to remove object: ', request.params.id)
    Person.findByIdAndRemove(request.params.id)
        .then(() => {
            response.sendStatus(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body
    const person = new Person({
        name: body.name,
        number: body.number
    })
    console.log('person: ', person)
    person.save().then(() => {
        response.json(person)
    })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    console.log('put: ', request.body)
    Person.findByIdAndUpdate(request.params.id, {number: request.body.number}, {runValidators: true})
        .then(() => {
            response.json(request.params).end()
        })
        .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
    console.log('errorHandler:', error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformed id'})
    }
    else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    else if (error.name === 'ReferenceError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
