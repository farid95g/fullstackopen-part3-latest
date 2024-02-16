require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
let { persons } = require('./data/index')
const Person = require('./models/person')

morgan.token('body', function getBody (request) {
  return JSON.stringify(request.body)
})

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    response.status(400).json({
      'message': 'Malformatted ID'
    })
  } else if (error.name === 'ValidationError') {
    response.status(400).json({ message: error.message })
  }

  next(error)
}

app.get('/api/persons', (_, response) => {
  Person
    .find({})
    .then(persons => response.json(persons))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person
    .findById(request.params.id)
    .then(foundedPerson => {
      if (foundedPerson) {
        response.json(foundedPerson)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response) => {
  Person
    .findByIdAndDelete(request.params.id)
    .then(result => {
      if (result) {
        response.status(204).end()
      }
      response.status(404).json({
        message: `Person with id ${request.params.id} does not exist in the phonebook.`
      })
    })
    .catch(error => console.log(error.message))
})

app.post('/api/persons', (request, response, next) => {
  const requiredFields = ['name', 'number']
  const responseMessages = {
    missing: (fields) => `The field ${fields} is required!`,
    unique: (name) => `The name ${name} already exists in the phonebook!`
  }
  const body = request.body

  const missingFields = requiredFields.map(field => {
    if (!body.hasOwnProperty(field) || body[field] === null) return field

    return null
  }).filter(value => !!value)

  if (missingFields.length) {
    return response.status(400).json({
      error: responseMessages.missing(missingFields.join(' and '))
    })
  }

  Person
    .findOne({ name: body.name })
    .then(foundedPerson => {
      if (!foundedPerson) {
        const person = new Person(body)

        person
          .save()
          .then(savedPerson => response.json(savedPerson))
          .catch(error => next(error))
      } else {
        response.status(422).json({
          message: `User named ${foundedPerson.name} already exists.`,
          id: foundedPerson.id
        })
      }
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  Person
    .findByIdAndUpdate(
      request.params.id,
      request.body,
      { new: true, runValidators: true, context: 'query' }
    )
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})


app.get('/info', (_, response, next) => {
  Person
    .find({})
    .then(persons => {
      response.send(`
                <p>Phonebook has info for ${persons.length} people</p>
                <p>${new Date()}</p>
            `)
    })
    .catch(error => next(error))
})

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => `App is running on the port ${PORT}`)