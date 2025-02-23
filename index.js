require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require("./models/person")
const app = express()
const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))
morgan.token('personbody', (req) => {
  const personbody = req.body
  if (req.method !== 'POST') {
    return null
  }
  delete personbody.id
  return JSON.stringify(personbody)
})

app.use(morgan(':method :url :status :total-time ms - :personbody'))

const PORT = process.env.PORT || 3001

app.get('/', (request, response) => {
    response.send('<h1>Hello Phonebook!</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(notes => {
    response.json(notes)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })
  .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  if (!body.name) {
    return response.status(400).json({'error': 'missing name'})
  }
  if (!body.number) {
    return response.status(400).json({'error': 'missing number'})
  }
  const person = new Person({
    name: body.name,
    number: body.number
  })
  person.save({runValidators: true}).then(person => {
    return response.json(person)
  }).catch(error => next(error))
})

app.get('/info', (request, response, next) => {
  Person.countDocuments({})
    .then(count => {
      response.send(`Phonebook has info for ${count} people.<p>${new Date().toString()}</p>`)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})



app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})