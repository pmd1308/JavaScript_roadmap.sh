const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('todo.db');

db.run(`
    CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0
)`);

function addTask(task) {
    return new Promise((res, rej) => {
        db.run(
            'INSERT INTO todos (task) ' +
            'VALUES (?)',
            [task],
            function (err) {
                err ? 
                    rej(err.message) : 
                    res(task);
            }
        );
    });
}

function readAllTasks() {
    return new Promise((res, rej) => {
        db.all('SELECT * ' + 
               'FROM todos',
               (err, rows) => {
                    err ? 
                        rej(err.message) : 
                        res(rows);
        });
    });
}

function removeTask(id) {
    return new Promise((res, rej) => {
        db.run('DELETE FROM todos ' +
               'WHERE id = ?', 
                [id], function (err) {
                    err ? 
                        rej(err.message) : 
                        res(id);
        });
    });
}

function updateTask(id, task) {
    return new Promise((res, rej) => {
        db.run(
            'UPDATE todos ' + 
            'SET task = ?' + 
            'WHERE id = ?',
            [task, id],
            function (err) {
                err ? 
                    rej(err.message) : 
                    res(id);
            }
        );
    });
}
