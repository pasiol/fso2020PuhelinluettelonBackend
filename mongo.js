const mongoose = require("mongoose");

if (process.argv.length < 6 || process.argv.length > 8 || process.argv.length===7) {
  console.log("syntax: mongo.js user password db host");
  process.exit(1);
}

const user = process.argv[2];
const password = process.argv[3];
const db = process.argv[4];
const host = process.argv[5];

const url = `mongodb+srv://${user}:${password}@${host}/${db}?retryWrites=true`;
console.log(url)

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

const personSchema = new mongoose.Schema({
  name: String,
  number: String
});
const Person = mongoose.model("person", personSchema);

if (process.argv.length === 8) {
  console.log("Trying to insert new person");
  const person = new Person({
    name: process.argv[6],
    number: process.argv[7]
  });
  person.save().then(result => {
    console.log(`added ${person.name} number ${person.number} to phonebook`);
    mongoose.connection.close();
  });
} else {
  console.log("phonebook:");
  Person.find({}).then(persons => {
    persons.forEach(person => {
      console.log(person.name, person.number);
    });
    mongoose.connection.close();
  });
}