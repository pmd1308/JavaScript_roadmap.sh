const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Handlebars = require('handlebars');
const sqlite3 = require('sqlite3');
const validator = require('validator');

// Cria as variaveis necessarias para a execução do programa 
let mainWindow;
let db;

// Cria um código SQL para criar as tabelas para esse programa, caso não existam.
const schema = `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS devices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
`;

// Cria uma classes usanco constructos, executa a sanitização e validação de dados
class User {
    constructor(id, name) {
        !validator.isAlpha(String(id)) || !validator.isAlpha(name) ? new Error('ID must be a number and name must contain only letters') : null;
        this.id = id;
        this.name = name;
        this.devices = [];
    }

    addDevice(device) {
        !(device instanceof Device) ? new Error('Device must be an instance of Device') : null;;
        this.devices.push(device);
    }
}

// Cria a classe Device e executa a sanitização de dados
class Device {
    constructor(id, type) {
        !validator.isAlpha(String(id)) || !validator.isAlpha(String(type)) ? 
            new Error('ID must be a string and type must be a string') : 
            null;
        this.id = id;
        this.type = type;
    }
}

// Cria a conexão com o banco de dados usando o sqlite, executando uma validação de erros
function openDatabase() {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(path.join(app.getPath('userData'), 'data.db'), (err) => {
            err ? 
                reject(err) :
                resolve('DB connected');
        });
    });
}

// Fecha a conexão com o banco de dados, exxecutando um verificador
function closeDatabase() {
    return new Promise((resolve, reject) => {
        db ?  
            db.close(err => err ? 
                reject(`Error when closing database: ${err.message}`) : 
                resolve('Closed database successfully')) : 
            resolve('No database connection to close');
    });
}

// Função para adicionar usuario no banco de dados, com uma validação de erros incluidas. Adicionei uma segunda camada para a sanitização.
function addUserDevice(userId, deviceId, deviceType) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO devices (user_id, type) VALUES (?, ?)`, [userId, deviceType], (err) => {
            err ? 
                reject(`Error: ${err}`) :
                resolve('Success');
        });
    });
}

// Função assincrona para uma melhor experiência do usuário. Ela faz a busca pelas chaves usando SQL. Após a solicitação, cria-se colunas com teoria de conjuntos aplicada. Há mais de um metodo impregado, por isso o uso do ```switch```
async function fetchUserData(updateType, updateData) {
    return new Promise((res, rej) => {
        let query;
        let params = [];

        switch (updateType) {
            case 'added':
                query = `
                    SELECT 
                        users.id as id,
                        users.name as name,
                        devices.id as deviceId,
                        devices.type
                    FROM users 
                    LEFT JOIN devices 
                    ON users.id = devices.user_id
                    WHERE users.id = ?;
                `;
                params.push(updateData.id);
                break;
            case 'deleted':
                query = `
                    SELECT 
                        id as userId 
                    FROM users 
                    WHERE id = ?;
                `;
                params.push(updateData.id);
                break;
            case 'modified':
                query = `
                    SELECT 
                        users.id as id,
                        users.name as name,
                        devices.id as deviceId,
                        devices.type
                    FROM users 
                    LEFT JOIN devices 
                    ON users.id = devices.user_id
                    WHERE users.id = ?;
                `;
                params.push(updateData.id);
                break;
            default:
                query = `
                    SELECT 
                        users.id as userId,
                        users.name, 
                        devices.id as deviceId, 
                        devices.type
                    FROM users 
                    LEFT JOIN devices 
                    ON users.id = devices.user_id;
                `;
                break;
        }

        // Extrai os dados do banco de dados e o organiza em um objeto de usuários se existir.
        // Também retorna os dispositvos. Está incluindo um validador de dados.
        // Tranforma o retorno em um objeto contendo dados sobre usuários e dispositivos associados
        db.all(query, params, (err, rows) => { 
            const users = err ? 
                undefined : 
                rows.reduce((acc, row) => {
                !acc[row.userId] ?
                    acc[row.userId] = { id: row.userId, name: row.name, devices: [] } :
                    null;
                row.deviceId && row.type ?
                    acc[row.userId].devices.push({ id: row.deviceId, type: row.type }) :
                    null;
            return acc;
            }, {});
        });
    });
}


async function createWindow() {
    try {
      await openDatabase();
  
      mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          preload: path.join(__dirname, 'preload.js')
        }
      });
  
      // Baseado no type do usuário, o evento na cadeia de casos é selecionado e executado o sql especifico e renderiza uma mensagem na tela
      ipcMain.on('userDataUpdate', async (event, { type, data }) => {
        try {
          const updatedUserData = await fetchUserData(type, data);
          mainWindow.webContents.send('userDataUpdated', updatedUserData);
        } catch (error) {
          console.error('Error fetching user data:', error.message);
          mainWindow.webContents.send('userDataUpdateError', { type, message: error.message });
        }
      });
  
      // O mesmo que a anterior, atualizando o Usernanme do usuário
      ipcMain.on('addUser', async (event, userName) => {
        try {
          const userId = await addUserToDatabase(userName);
          const userData = await fetchUserData('added', { id: userId });
          mainWindow.webContents.send('userDataUpdated', userData);
          mainWindow.webContents.send('operationResult', { type: 'addUser', success: true, message: 'User added successfully.' });
        } catch (error) {
          console.error('Error adding user:', error.message);
          mainWindow.webContents.send('operationResult', { type: 'addUser', success: false, message: error.message });
        }
      });
  
      // Mesmo que a anterior, só que para dispositivos
      ipcMain.on('addDevice', async (event, { userId, deviceId, deviceType }) => {
        try {
          await addUserDevice(userId, deviceId, deviceType);
          const userData = await fetchUserData('modified', { id: userId });
          mainWindow.webContents.send('userDataUpdated', userData);
          mainWindow.webContents.send('operationResult', { type: 'addDevice', success: true, message: 'Device added successfully.' });
        } catch (error) {
          console.error('Error adding device:', error.message);
          mainWindow.webContents.send('operationResult', { type: 'addDevice', success: false, message: error.message });
        }
      });
  
      // A função addUserToDatabase adiciona um novo usuário ao banco de dados e retorna uma promessa. 
      // A promessa é resolvida com o ID do usuário recém-criado se a inserção for bem resolvida, ou rejeitada com um erro caso contrário.
      async function addUserToDatabase(userName) {
        return new Promise((resolve, reject) => {
          const query = 'INSERT INTO users (name) VALUES (?)';
          db.run(query, [userName], function (err) {
            err ? 
                reject(err) :
                resolve(this.lastID);
          });
        });
      }
  
      // A variavel userdata é carregada e armazena o retorno dos dados do banco de dados
      const userData = await fetchUserData();
  
      const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Electron App</title>
          <style>
            body { font-family: Arial, sans-serif; }
            form { margin-bottom: 20px; }
          </style>
        </head>
        <body>
            <!-- Mostrador de informações -->
          <h1>User Data and Their Devices</h1>
          <div id="user-data-output"></div>
          <div id="operation-feedback"></div>
          <form id="addUserForm">
            <input type="text" name="userName" placeholder="Enter user name" required />
            <button type="submit">Add User</button>
          </form>
          <form id="addDeviceForm">
            <input type="text" name="userId" placeholder="User ID" required />
            <input type="text" name="deviceId" placeholder="Enter device ID" required />
            <input type="text" name="deviceType" placeholder="Enter device type" required />
            <button type="submit">Add Device</button>
          </form>
          <script id="user-template" type="text/x-handlebars-template">
            {{#each userData}}
              <div>
                <strong>{{name}}</strong>:
                {{#each devices}}
                  {{type}} [ID: {{id}}]
                {{/each}}
              </div>
            {{/each}}
          </script>
          <script>
            const template = Handlebars.compile(document.getElementById('user-template').innerHTML);
            const outputElement = document.getElementById('user-data-output');
            const feedbackElement = document.getElementById('operation-feedback');
  
            outputElement.innerHTML = template({ userData });
  
            const { ipcRenderer } = require('electron');
  
            document.getElementById('addUserForm').addEventListener('submit', async (event) => {
              event.preventDefault();
              const formData = new FormData(event.target);
              const userName = formData.get('userName');
              ipcRenderer.send('addUser', userName);
            });
  
            document.getElementById('addDeviceForm').addEventListener('submit', async (event) => {
              event.preventDefault();
              const formData = new FormData(event.target);
              const userId = formData.get('userId');
              const deviceId = formData.get('deviceId');
              const deviceType = formData.get('deviceType');
              ipcRenderer.send('addDevice', { userId, deviceId, deviceType });
            });
  
            ipcRenderer.on('userDataUpdated', (event, userData) => {
              outputElement.innerHTML = template({ userData });
            });
  
            ipcRenderer.on('operationResult', (event, { type, success, message }) => {
              if (success) {
                feedbackElement.innerHTML = '<div style="color: green;">' + message + '</div>';
              } else {
                feedbackElement.innerHTML = '<div style="color: red;">' + message + '</div>';
              }
            });
          </script>
        </body>
        </html>
      `;
  
      mainWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(htmlTemplate)}`);
    } catch (error) {
      console.error('Error creating window:', error.message);
    }
  }
  
  app.whenReady().then(createWindow);
  
  app.on('window-all-closed', () => {
    closeDatabase()
      .then(() => {
        if (process.platform !== 'darwin') {
          app.quit();
        }
      })
      .catch(err => {
        console.error('Error closing database:', err.message);
      });
  });
  
  app.on('activate', () => {
    if (!mainWindow) {
      createWindow();
    }
  });
  