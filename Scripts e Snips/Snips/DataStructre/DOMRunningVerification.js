/*
    Esse script processa nós do Dm e evitar processa-los novamente, 
    permitindo otimizar algumas operações como adicionar classe.
    ---
    Na real, esse script é mais para aprender a como usar o weakset do JS
*/

const domNodeProcessed = new WeakSet();

function processNode(node) {
    if (domNodeProcessed.has(node)) {
        return;
    }

    domNodeProcessed.add(node);

    if (node.nodeType === Node.ELEMENT_NODE) {
        node.classList.add('processed');
    }

    for (const childNode of node.childNodes) {
        processNode(childNode);
    }
}