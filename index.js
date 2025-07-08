const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

// Kustomoitu tokeni, joka palauttaa pyynnön sisällön
morgan.token('content', function (req, res) {
  return JSON.stringify(req.body);
});
// Käytetään morgan:ia hakujen loggaamiseen
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms')
);

let persons = [
  {
    name: 'Arto Hellas',
    number: '040-123456',
    id: '1',
  },
  {
    name: 'Ada Lovelace',
    number: '39-44-5323523',
    id: '2',
  },
  {
    name: 'Dan Abramov',
    number: '12-43-234345',
    id: '3',
  },
  {
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
    id: '4',
  },
];
// root sivu
app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>');
});

// kaikkien henkilöiden sivu
app.get('/api/persons', (request, response) => {
  response.json(persons);
});

// infosivu
app.get('/info', (request, response) => {
  response.send(
    `<p>Phonebook has info for ${
      persons.length
    } people </p><p>${new Date()}</p>`
  );
});

// yksittäisen henkilön sivu
app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  const person = persons.find((person) => person.id === id);

  // katsotaan onko henkilö olemassa ja vastataan 404 jos ei ole
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

// henkilön poisto
app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  persons = persons.filter((person) => person.id !== id);
  response.status(204).end();
});

// henkilön lisäys, logataan tässä myös pyynnön sisältö eli lisättävä henkilö
app.post('/api/persons', morgan(':content'), (request, response) => {
  // generoidaan random id
  const id = Math.floor(Math.random() * (50 - 10) + 10);
  const person = request.body;
  // katsotaan onko duplikaatteja
  const duplicates = persons.filter(
    (person) => person.name === request.body.name
  );
  if (!person.name) {
    return response.status(400).json({ error: 'name is mandatory' });
  } else if (!person.number) {
    return response.status(400).json({ error: 'number is mandatory' });
  } else if (duplicates.length !== 0) {
    return response.status(400).json({ error: 'name must be unique' });
  }
  person.id = String(id);
  persons = persons.concat(person);
  response.json(person);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
