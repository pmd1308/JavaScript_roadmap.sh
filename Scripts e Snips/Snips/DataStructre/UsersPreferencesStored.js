/*
    Não traduzi os comentarios para treinar o inglês por que quero dar 
    dinheiro pro Duolingo, embora eu saiba inglês kkk.
    ---
    Processo para atualizar preferências a partir de um ID. Adicionei o
     multthread apenas para treino, e estou ligado que não deve ser uma 
     boa pratica
    ---
    A informalidade é por que codo para treinar e a quinta serie ainda não 
    saiu de mim, na real, só sai depois dos trintas e olhe lá. Além disso, 
    se alguem for me chamar para trabalhar como programador, quero ser 
    contratado porqyue o pai é foda, dado que em menos de 1 mês de estudo, 
    já estou conseguindo aplicar conceito de criptografia e multhread nos 
    meus script e aprendi Java em uma semana, e partindo dessa premissa,
    prefiro contratado por ser o mais foda nessa porra, e não por saber
    colocar mascara e chupar um pau de algum executivo kkkkkk
*/

const { Worker, isMainThread, parentPort } = require('worker_threads');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('todo.db');

export async function updatePreferences(ID, preferenceKey, preferenceValue) {
    const db = opernDatabase();
    db.run(`
        UPDATE userprofile 
        SET preferences =
            JSON_SET(
                preferences, 
                ?, 
                ?)
        WHERE
            id = ?`,
        [preferenceKey, JSON.stringify(preferenceValue), ID], function (err) {
            err ? 
                console.error(err) :
                console.log(ID);
            db.close();
        });
}
        
export async function getUserPreferences(ID) {
    const db = opernDatabase();
    db.get(`
        SELECT preferences
        FROM userprofile
        WHERE id = ?`,
        [ID], function (err, row) {
            err ? 
                console.error(err) :
                row ?
                    console.log(row):
                    console.log('Not found');
            db.close();
        });
}

// Criar Worker Threads para cada operação
isMainThread ? (
    (() => {
        const updateUserPreferenceWorker = new Worker('Pinto_Mole');
        const getUserPreferencesWorker = new Worker('Pinto Duro');
        updateUserPreferenceWorker.postMessage({ action: 'updatePreferences', ID: '8==B', preferenceKey: 'theme', preferenceValue: 'Boiola' });
        getUserPreferencesWorker.postMessage({ action: 'getUserPreferences', userId: '8==B' });
    })() )
    : (
        parentPort.on('message', (message) => {
            const { action, ID, preferenceKey, preferenceValue } = message;
            switch (action) {
                case 'updateUserPreference':
                    updateUserPreference(ID, preferenceKey, preferenceValue);
                    break;
                case 'getUserPreferences':
                    getUserPreferences(ID);
                    break;
                default:
                    console.error(`Invalid action: ${action}`);
                    
        }
    })
);
