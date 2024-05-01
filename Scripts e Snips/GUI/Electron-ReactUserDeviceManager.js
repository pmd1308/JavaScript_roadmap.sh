/*
This code implements an Electron application integrated with React to manage users and their devices. 
It utilizes SQLite as the database backend. 
The Electron main process handles window creation, IPC communication, and database interactions, while 
React components provide a user-friendly interface for adding users, adding devices, and displaying user data with their associated devices. 
The application allows users to input user information and device details, 
which are then stored in the SQLite database and displayed in real-time in the user interface.
*/

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Handlebars = require('handlebars');
const sqlite3 = require('sqlite3');

let mainWindow;
let db;

// Define the database schema
const schema = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT
);
CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
`;

class User {
  constructor(id, name) {
    if (typeof id !== 'number' || typeof name !== 'string') {
      throw new Error('ID must be a number and name must be a string');
    }
    this.id = id;
    this.name = name;
    this.devices = [];
  }

  addDevice(device) {
    if (!(device instanceof Device)) {
      throw new Error('Device must be an instance of Device');
    }
    this.devices.push(device);
  }
}

class Device {
  constructor(id, type) {
    if (typeof id !== 'string' || typeof type !== 'string') {
      throw new Error('ID and type must be strings');
    }
    this.id = id;
    this.type = type;
  }
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const dbPath = path.join(app.getPath('userData'), 'data.db');
    db = new sqlite3.Database(dbPath, err => {
      err ? reject(err) : db.exec(schema, err => 
        reject(err) ? reject(err) : resolve())
    });
  });
}

function closeDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close(err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}

function addUserDevice(userId, deviceId, deviceType) {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO devices (id, user_id, type) VALUES (?, ?, ?)';
    db.run(query, [deviceId, userId, deviceType], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function fetchUserData(updateType, updateData) {
  return new Promise((resolve, reject) => {
    let query;
    let params = []; // Array to hold query parameters

    switch (updateType) {
      case 'added':
        query = `
          SELECT users.id as userId, users.name, devices.id as deviceId, devices.type
          FROM users LEFT JOIN devices ON users.id = devices.user_id
          WHERE users.id = ?;
        `;
        params.push(updateData.id); // Add updateData.id as a parameter
        break;
      case 'deleted':
        query = `
          SELECT id as userId FROM users WHERE id = ?;
        `;
        params.push(updateData.id); // Add updateData.id as a parameter
        break;
      case 'modified':
        query = `
          SELECT users.id as userId, users.name, devices.id as deviceId, devices.type
          FROM users LEFT JOIN devices ON users.id = devices.user_id
          WHERE users.id = ?;
        `;
        params.push(updateData.id); // Add updateData.id as a parameter
        break;
      default:
        query = `
          SELECT users.id as userId, users.name, devices.id as deviceId, devices.type
          FROM users LEFT JOIN devices ON users.id = devices.user_id;
        `;
        break;
    }

    db.all(query, params, (err, rows) => { // Pass params to db.all
      if (err) {
        reject(err);
      } else {
        const users = {};
        rows.forEach(row => {
          if (!users[row.userId]) {
            users[row.userId] = { id: row.userId, name: row.name, devices: [] };
          }
          if (row.deviceId && row.type) {
            users[row.userId].devices.push({ id: row.deviceId, type: row.type });
          }
        });
        resolve(Object.values(users));
      }
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

    ipcMain.on('userDataUpdate', async (event, { type, data }) => {
      try {
        const updatedUserData = await fetchUserData(type, data);
        mainWindow.webContents.send('userDataUpdated', updatedUserData);
      } catch (error) {
        console.error('Error fetching user data:', error.message);
        mainWindow.webContents.send('userDataUpdateError', { type, message: error.message });
      }
    });

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

    async function addUserToDatabase(userName) {
      return new Promise((resolve, reject) => {
        const query = 'INSERT INTO users (name) VALUES (?)';
        db.run(query, [userName], function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID); // Return the ID of the newly inserted user
          }
        });
      });
    }

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
