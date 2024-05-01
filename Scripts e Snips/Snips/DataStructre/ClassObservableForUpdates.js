/*
    Esse script cria uma classe que notifica alguém
    sempre que uma mudança ocorre, o que é perfeito para implementação
    de eventos em JS, Interfaces reativas e integração com APIs Assincronas
    para notificação.
*/

class Observable {
    constructor() {
        this.observers = new Set(); // Evita duplicatas
    }
  
    // Metodos são criados
    addObserver(observer) {
        this.observers.add(observer);
    }
  
    removeObserver(observer) {
        this.observers.delete(observer);
    }
  
    notifyObservers(property, newValue, oldValue) {
        for (const observer of this.observers) {
            observer(property, newValue, oldValue);
        }
    }
  }
  
    // Configurando a observação para uma propriedade
    const obj = new Observable();
    obj.value = 10;
    
    obj.addObserver((property, newValue, oldValue) => {
        console.log(`Propriedade "${property}" alterada: ${oldValue} -> ${newValue}`);
    });
    
    // Alterando a propriedade e notificando observadores
    obj.notifyObservers('value', 20, 10); // Notifica os observadores da alteração