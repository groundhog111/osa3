const mongoose = require('mongoose')

if ( process.argv.length<3 ) {
   console.log('give password as argument')
   process.exit(1)
 }

const password = process.argv[2]
const url = `mongodb+srv://fullstackUrho:${password}@cluster0-i1nlb.mongodb.net/persons?retryWrites=true`

const name = process.argv[3]
const number = process.argv[4]

const personSchema = new mongoose.Schema({
   name: String,
   number: Number,
 })
 
 const Person = mongoose.model('Person', personSchema)

if (name && number) {
   
   console.log(`lisätään ${name} numero ${number} luetteloon`)

   mongoose.connect(url, { useNewUrlParser: true })
   
   const person = new Person({
      name: name,
      number: number
   })
   
   person.save()
   .then( response => {
      console.log("person saved"),
      mongoose.connection.close()
   })
   
}

else {
   console.log("haetaan pilvestä all the people")
   
   mongoose.connect(url, { useNewUrlParser: true })
   Person.find({}).then(result => {
      result.forEach(person => {
        console.log(person.name, person.number)
      })
      mongoose.connection.close()
    })
}





