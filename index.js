const express = require('express')
const bodyParser = require('body-parser') 
const morgan = require('morgan')
const cors = require('cors')

const app = express()


var persons = [
   {
      id: 0,
      name: "Urho Vepsalainen",
      number: "0501802803"
   },
   {
      id: 1,
      name: "Vilma Koira",
      number: "030666666"
   },
   {
      id: 2,
      name: "Heidi Nampajarvi",
      number: "050999999"
   },
]

app.use(cors())
app.use(bodyParser.json())

morgan.token('postbody', function (req, res) { 
   if(req.method == "POST") {
      return JSON.stringify(req.body)
   }
 })

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postbody'))


const generateId = () => {
  return Math.floor((Math.random() * 100000))
}

app.get('/', ((req,res) => {
  res.send('<h1>juuripolku, myöhemmin staattinen sivu react</h1>')
}))

app.get("/info", ((req,res) => {
   const date = new Date()
   const palautus = `<p>Puhelinluettelossa on ${persons.length} henkilön tiedot</p> <p>${date}</p>`
   res.send(palautus)
}))

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  if(persons.find(person=>person.id == id)) {
     persons = persons.filter(person => person.id !== id)
     response.status(204).end()
  }
  else response.status(404).end
})

app.post('/api/persons', (request, response) => {
   const body = request.body
   if (body.name === undefined || body.name.length == 0) response.status(400).json({ error: 'Name missing' })
   else if (body.number === undefined  || body.number.length == 0) response.status(400).json({ error: 'Number missing' })
   else if (persons.find((person) => person.name === body.name)) response.status(400).json({ error: 'Name already exists' })
   else {
      const person = {
        name: body.name,
        number: body.number,
        id: generateId(),
      }
      persons = persons.concat(person)
      response.json(person)
   }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})