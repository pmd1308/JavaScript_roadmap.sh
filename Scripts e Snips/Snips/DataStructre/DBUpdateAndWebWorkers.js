/* 
    A área do meu cérebro relacionada à tradução está em greve, então as mensagens vou escrever em português :) 
    ---
    Nesse script tentei trabalhar com blob dentro de outro script. 
    Aqui uso uma função que atualiza uma tabela ou cria caso ela não exista. 
    Criei um worker para ela, justamente para não interromper a thread principal que estiver ocorrendo. 
    ---
    PS, e sim, estou pensando em blobs para ataque de injeção 8==B
*/

/* 
    A área do meu cérebro relacionada à tradução está em greve, então as mensagens 
    vou escrever em português :) 
    ---
    Esse script está errado pois fiz um teste usando o chatGPT para terceirizar 
    o copia e cola de todo programador mais forte, mas não deu muito certo ou 
    eu que sou burro mesmo.
*/

async function addToCart(dataID, data) {
    try {
        // Criando um URL de blob para o código do worker
        const workerScript = `
        async function update(productId, newQuantity) {
        try {
            const query = \`
              UPDATE shopping_cart
              SET quantity = ?
              WHERE user_id = ? AND product_id = ?
            \`;
        
            await connection.query(query, [newQuantity, /* user ID */, productId]);
        
            console.log('Cart item quantity updated successfully!');
          } catch (error) {
            console.error('Error updating cart item quantity:', error);
          }
        }

            self.addEventListener('message', async (eve) => {
                const { dataID, data, name } = eve.data;
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
