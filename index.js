const express = require('express');
const app = express();
const port = 8081;
const jsonObject = require('./users.json');
const fs = require('fs');
app.use(express.static('public'));
app.use(express.json());

app.get('/produtos/all', function (req, res) {
    res.json(jsonObject);
});

app.get('/search', function (req, res) {
    const value = Object.values(req.query)[0];
    const key = Object.keys(req.query)[0];

    const filtered = jsonObject.filter((element) => {
        if (key == "id") {
            return element[key] === Number(value);
        } else {
            return element[key].toLowerCase().includes(value.toLowerCase());
        }
    });
    filteredResponse(filtered, res);
});

app.post('/save', function (req, res) {
    let dataFromClient = req.body;
    let lastId = (jsonObject[jsonObject.length - 1].id);
    let doesTheIdExist = false;

    do {
        for (let i = 0; i < jsonObject.length; i++) {
            const currentID = jsonObject[i].id;
            if (lastId === currentID) {
                lastId++;
                doesTheIdExist = true;
            }
        }
    } while (doesTheIdExist === false);

    dataFromClient.id = lastId;
    jsonObject.push(dataFromClient);

    fs.writeFile('users.json', JSON.stringify(jsonObject), function (err) {
        if (err) throw err;
        res.json(dataFromClient);
    });
});

app.delete('/delete', function (req, res) {
    const idFromClient = Number(req.body.id);

    if (idFromClient) {
        const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
        const userToBeDeleted = users.find((el) => el.id === idFromClient);

        if (userToBeDeleted) {
            const userToBeDeletedIndex = users.indexOf(userToBeDeleted);
            users.splice(userToBeDeletedIndex, 1);

            fs.writeFile('users.json', JSON.stringify(users), function (err) {
                if (!err) {
                    res.json(userToBeDeleted);
                } else {
                    throw err;
                }
            });
        }
    }
});

app.put('/update', function (req, res) {
    const userFromClient = req.body;
    console.log(userFromClient);

    if (userFromClient) {
        const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
        const userToBeUpdated = users.find((el) => el.id === parseInt(userFromClient.id));

        if (userToBeUpdated) {
            const userToBeUpdatedIndex = users.indexOf(userToBeUpdated);
            users[userToBeUpdatedIndex].name = userFromClient.name;

            fs.writeFile('users.json', JSON.stringify(users), function (err) {
                if (!err) {
                    res.json(userToBeUpdated);
                } else {
                    throw err;
                }
            });
        }
    }
})

function filteredResponse(filteredJSON, res) {
    if (filteredJSON.length > 0) {
        res.json(filteredJSON);
    } else {
        res.send({ error: true, msg: "NENHUM RESULTADO ENCONTRADO" });
    }
}

app.listen(port, () => console.log(`Listening: ${port} port`));