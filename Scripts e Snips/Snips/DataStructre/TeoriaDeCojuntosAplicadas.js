/* 
    Escrevi esse script após ter passado a manhã inteira codando.
    Então a essa altura do campeonado, eu apenas tô deixando em 
    português os títulos e os comentários.
    ---
    Esse script é mais para treinar teoria de conjuntos no JS,
    Com uma classe que carrega os metodos para isso.
*/

class Community {
    constructor(members) {
        this.members = members || [];
    }

    // Retorna a lista de menbros que pertecem a ambas comunidades.
    intersection(otherCommunity) {
        return this
                   .members
                   .filter(member => otherCommunity.members.includes(member))
    }

    // Retona lista combinada de todos os membros da comuinidades
    union(otherCommunity) {
        return [...new 
            Set([...this.members, ...otherCommunity.members])];
    }

    // Retorna todos os membros da comunidade atual que estão presentes na outra comunidade
    isSubsetOf(otherCommunity) {
        return this.members.every(member => otherCommunity.members.includes(member));
    }

    // Comunidade vazia?
    isEmpty() {
        return this.members.length === 0;
    }

    // Pertinencia
    isMember(member) {
        return this.members.includes(member);
    }

    // Verifica se todos os membros da segunda estão na primeira
    includesCommunity(otherCommunity) {
        return otherCommunity.members.every(member => this.members.includes(member));
    }

}

// Exemplo de uso:
const communityA = new Community(['user1', 'user2', 'user3']);
const communityB = new Community(['user2', 'user3', 'user4']);

console.log("Interseção:", communityA.intersection(communityB)); // Output: ['user2', 'user3']
console.log("União:", communityA.union(communityB)); // Output: ['user1', 'user2', 'user3', 'user4']
console.log("É subconjunto:", communityA.isSubsetOf(communityB)); // Output: false
console.log("É vazio:", communityA.isEmpty()); // Output: false
console.log("É membro de 'user1':", communityA.isMember('user1')); // Output: true
console.log("Inclui a comunidade B:", communityA.includesCommunity(communityB)); // Output: false