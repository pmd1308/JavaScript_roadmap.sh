/* 
    A área do meu cérebro relacionada à tradução está em greve, então as mensagens vou escrever em português :) 
    ---
    Nesse script tentei trabalhar com blob dentro de outro script. 
    Aqui uso uma função que atualiza uma tabela ou cria caso ela não exista. 
    Criei um worker para ela, justamente para não interromper a thread principal que estiver ocorrendo. 
    ---
    PS, e sim, estou pensando em blobs para ataque de injeção 8==B
*/

async function addToCart(dataID, data) {
    try {
        // Criando um URL de blob para o código do worker
        const workerScript = `
            async function addToCart(dataID, data, name) {
                // Esta função é apenas para treinamento
                const existingData = await getData(data)
                    .then(items => items.find(item => item.dataID === dataID));

                // Atualiza o item se existir ou cria os dados
                existingData ?
                    await addToData(dataID, data + existingData.quantity, name) :
                    await connection.query(
                        \`
                        INSERT INTO data_db (
                            data_id,
                            data,
                            name
                        )
                        VALUES (?, ?, ?)
                        \`,
                        [dataID, data, name]
                    );
                return dataID;
            }

            self.addEventListener('message', async (event) => {
                const { dataID, data, name } = event.data;
                const result = await addToCart(dataID, data, name);
                self.postMessage(result);
            });
        `;

        const blob = new Blob([workerScript], { type: 'application/javascript' });
        const workerURL = await URL.createObjectURL(blob);
        const worker = new Worker(workerURL);

        // Enviando mensagem para o worker
        worker.postMessage({ dataID, data, name });

        // Lidando com mensagens do worker
        worker.onmessage = (eve) => {
            console.log('Item adicionado ao carrinho:', eve.data);
            URL.revokeObjectURL(workerURL);
        };

        // Lidando com erros do worker
        worker.onerror = (err) => {
            console.error('Erro no worker:', err.message);
            URL.revokeObjectURL(workerURL);
        };
    } catch (error) {
        console.error(error);
    }
}
