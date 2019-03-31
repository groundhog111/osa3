if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express')
const bodyParser = require('body-parser') 
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(express.static('build'))
app.use(cors())
app.use(bodyParser.json())


morgan.token('postbody', function (request, response) { 
   if(request.method == "POST") {
      return JSON.stringify(request.body)
   }
 })

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postbody'))

app.get('/', ((request,response) => {
  response.send('<h1>juuripolku, myöhemmin staattinen sivu react</h1>')
}))

app.get("/info", ((request,response) => {
   const date = new Date()
   Person.find({})
   .then(people => {
     const palautus = `<p>Puhelinluettelossa on ${people.length} henkilön tiedot</p> <p>${date}</p>`
     response.send(palautus)}
   )
}))

//API alkaa tästä
app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(people => {
    response.json(people)
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person.toJSON())
      } else {
        response.status(404).end() 
      }
    })
    .catch(error => next(error))
  
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  const person = {
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
   const body = request.body
   if (body.name === undefined || body.name.length == 0) response.status(400).json({ error: 'Name missing' })
   else if (body.number === undefined  || body.number.length == 0) response.status(400).json({ error: 'Number missing' })
   else {
      const person = new Person({
        name: body.name,
        number: body.number
      })

      person.save().then(savedPerson => {
        response.json(savedPerson.toJSON())
      })
      .catch(error=> next(error))
   }
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind == 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } 
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})