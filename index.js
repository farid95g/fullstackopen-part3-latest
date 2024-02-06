const express = require('express')
const morgan = require('morgan')
let { persons } = require('./data/index')

morgan.token('body', function getBody (request) {
    return JSON.stringify(request.body)
})

const app = express()

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (_, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = +request.params.id
    const person = persons.find(p => p.id === id)

    if (!person) {
        return response.status(404).end()
    }

    response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = +request.params.id
    persons = persons.filter(p => p.id !== id)
    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
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
    } else if (persons.find(p => p.name === body.name)) {
        return response.status(400).json({
            error: responseMessages.unique(body.name)
        })
    }

    const person = {
        id: Math.random(),
        ...body
    }

    persons = persons.concat(person)
    response.json(person)
})

app.get('/info', (_, response) => {
    response.send(`
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date()}</p>
    `)
})

const PORT = 3001
app.listen(PORT, () => `App is running on the port ${PORT}`)