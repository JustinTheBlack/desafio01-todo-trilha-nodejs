const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const userExist = users.find((user) => user.username === username);
  if (!userExist) {
    return response.status(404).json({ error: 'Username not found!' });
  }
  request.user = userExist;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const userExist = users.find((user) => user.username === username);
  if (userExist) {
    return response.status(400).json({ error: 'Username already exists!'});
  }
  const newuser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };
  users.push(newuser);
  return response.status(201).json(newuser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const newtodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(newtodo);

  return response.status(201).json(newtodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todomerge = user.todos.find((todo) => todo.id === id);

  if (!todomerge) {
    return response.status(404).json({ error: "Todo not found !"})
  }
  todomerge.title = title;
  todomerge.deadline = new Date(deadline);

  return response.status(201).json(todomerge);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todomerge = user.todos.find((todo) => todo.id === id);

  if (!todomerge) {
    return response.status(404).json({ error: "Todo not found !"})
  }
  todomerge.done = true;

  return response.status(201).json(todomerge);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const tododelete = user.todos.find((todo) => todo.id === id);

  if (!tododelete) {
    return response.status(404).json({ error: "Todo not found !"})
  }

  user.todos.splice(tododelete, 1);
  return response.status(204).send();
});

module.exports = app;