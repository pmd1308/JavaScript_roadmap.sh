// DATABASE RETRIEVE and FORK PROCESS //
    /* 
        The function getDate uses a Promise to asynchronously 
        fetch data_id and name from a data_examples table based 
        on a provided data_id. It maps the results into an array
        of objects. Its running i background using Child_Process
        librarie
    */

    const { fork } = require('child_process');
    function getDate() { 
        return new Promise((res, err ) => {
            const query = `
                SELECT 
                    data_id,
                    name
                FROM data_examples
                WHERE data_id = ?
                `;
            try {
                connection.query(query, [data_id], (err, res) => {
                    const data = res.map(row => ({
                        data_id: row.data_id,
                        name: row.name,
                    }))
                });
            } catch (err) {
                reject(err);
            }
        });
    }
    // Create a secondary process
    const childProcess = fork(__filename);

    childProcess.on('message', async (message) => {
        if (message === 'start') {
            try {
                const data = await getDate();
                childProcess.send(data);
            } catch (err) {
                childProcess.send(err);
            }
        }
    });

    childProcess.send('start');

