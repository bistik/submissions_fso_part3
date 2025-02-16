const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

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

const PORT = 3001

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
    response.send('<h1>Hello Phonebook!</h1>')
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(p => p.id === id)
  if (person) {
    response.json(person)
  }
  response.status(404).end()
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(p => p.id !== id)

  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const person = request.body
  if (!person.name) {
    return response.status(400).json({'error': 'missing name'})
  }
  if (!person.number) {
    return response.status(400).json({'error': 'missing number'})
  }
  if (persons.find(p => p.name === person.name)) {
    return response.status(400).json({'error': 'name already exists'})
  }
  person.id = Math.round(Math.random() * 100000)
  persons = persons.concat(person)

  response.json(person)
})

app.get('/info', (request, response) => {
  response.send(`Phonebook has info for ${persons.length} people.<p>${new Date().toString()}</p>`)
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})