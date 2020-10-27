const express = require("express");
const cors = require("cors");

const { v4: uuid, validate } = require('uuid');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function validateRepositoryId(request, response, next){
    const {id} = request.params;
    if(!validate(id)){
        return response.status(400).json({error: "Invalid repository id"});
    }
    const repositoryIndex = repositories.findIndex(repository => repository.id === id);
    if(repositoryIndex < 0){
        return response.status(400).json({error: "Repository that does not exist"});
    }
    request.repositoryIndex = repositoryIndex;
    return next();
}

app.use('/repositories/:id', validateRepositoryId);

app.get("/repositories", (request, response) => {
    return response.json(repositories);
});

app.post("/repositories", (request, response) => {
    const {title, url, techs} = request.body;
    const repository = { id: uuid(), title, url, techs, likes: 0 };
    repositories.push(repository);
    response.send(repository);
});

app.put("/repositories/:id", (request, response) => {
    const {repositoryIndex} = request;
    const oldRepository = repositories[repositoryIndex];
    const {title = oldRepository.title, url = oldRepository.url, techs = oldRepository.techs} = request.body;
    const repository = {...oldRepository, title, url, techs};
    repositories[repositoryIndex] = repository;
    return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {
    const {repositoryIndex} = request;
    repositories.splice(repositoryIndex, 1);
    return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
    const {repositoryIndex} = request;
    const repository = repositories[repositoryIndex];
    repository.likes = repository.likes+1;
    return response.json(repository);
});

module.exports = app;
