/*
    Script para o uso de cache de objetos usando o node-cache.
    Ele cria um objeto com o tempo de vida de 100 segundo e com
    o periodo de verificação de 120 segundos, além de um verificador 
    do seu estado. O objetivo desse código é aprender a reduzir o 
    numero de operações na fonte de dados, e manter uma memoria mais
    limpa e com menos dados obsoletos, melhorando a experiência.
    ---
    O uso do TTL é um valor bom.
*/

const NodeCache = require('node-cache');
const objectCache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

function createObject(id) {
    return {
        id: id,
        data: `Object ${id}`,
        timestamp: new Date()
    };
}

function getOrCreateObject(id) {
    const cachedObject = objectCache.get(id);
    return cachedObject ?
        (() => {
            console.log(cachedObject);
            return cachedObject;
        })() :
        (() => {
            console.log(`Creating object ${id}`);
            const newObj = createObject(id);
            objectCache.set(id, newObj);
            return newObj;
        })();
}
