const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please, provide password for connecting to database!')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://faridg1995:${password}@cluster0.nw3lfgb.mongodb.net/phonebookDb`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

async function interactWithDb() {
  if (process.argv.length === 3) {
    const persons = await Person.find({})
    console.log('\x1b[33m%s\x1b[0m', 'Phonebook:')
    persons.forEach(p => console.log(`\x1b[35m${p.name} \x1b[32m${p.number}`))
  } else if (process.argv.length > 3) {
    const person = new Person({
      name: process.argv[3],
      number: process.argv[4]
    })

    const savedPerson = await person.save()
    console.log('\x1b[31m%s\x1b[0m', `Added ${savedPerson.name} number ${savedPerson.number} to phonebook!`)
  }
  mongoose.connection.close()
}

interactWithDb()
