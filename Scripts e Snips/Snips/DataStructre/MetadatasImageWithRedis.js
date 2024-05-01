/*
    Codigo implementa o uso do Redis para armazenar metadados
    como cache justamente pela performance.  Além de ter implementado um tratamento
    de erros e um script para calcular os metadados de forma assunctrona.
*/

const redis= require('Redis');
const sharp = require('sharp'); // Processamento de imagens
const { promisify } = require('util');

const client = redis.createClient({
    // Credenciais (Eu particulamente pegaria de variaveis de ambiente, para evitar bugs)
    host : process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6397
});
client.on('error', (err) => console.error(err));

// Permitir a execução assincrona do redis
const getAsync = promisify(client.get)
                .bind(client);
const setAsync = promisify(client.set).
                bind(client);

async function calculateImageMetadata(imageBuffer) {
    try {
        const metadata = await sharp(imageBuffer).metadata();
        return metadata;
    } catch (err) {
        console.error(err);
        return null;
    }
}

// Me da os metadatos e o id da imagem
async function getImageMetadata(imageId, imageBuffer) {
    try {
        const cacheKey = `image-meta-${imageId}`
        let metadata = await getAsync(cacheKey);

        metadata ?
            JSON.parse(metadata):
            metadata = await calculateImageMetadata(imageBuffer) ?
                (() => {
                    setAsync(cacheKey, JSON.stringify(metadata), 'EX', 3600)
                    return metadata
                }) : /// 1 hora para Expiração
                null 
    } catch (err) {
        console.error(err);
        return null;
    }
}