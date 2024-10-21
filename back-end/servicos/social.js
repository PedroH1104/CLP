const fs = require("fs");
const { getNomeDoUsuario } = require("../servicos/usuario");

function adicionarNovoComentario(novoComentario) {
    const comentarios = JSON.parse(fs.readFileSync("BD/SocialBD.json"));
    const nomeUsuario = getNomeDoUsuario(novoComentario.usuario_id);
    
    // Edita o novo comentário para incluir o nome do usuário em vez do ID
    const comentarioEditado = {
        ...novoComentario,
        nomeUsuario: nomeUsuario
    };
    delete comentarioEditado.usuario_id; // Remove o atributo usuario_id

    const novaListaDeComentarios = [...comentarios, comentarioEditado];
    fs.writeFileSync("BD/SocialBD.json", JSON.stringify(novaListaDeComentarios));
}

function buscarTodosComentarios(){
    const todosComentarios = JSON.parse(fs.readFileSync("BD/SocialBD.json")) 
    return todosComentarios
}


function editarComentario(idComentario, usuarioQueCurtiu) {
    // Lê os comentários do arquivo JSON
    let comentarios = JSON.parse(fs.readFileSync("BD/SocialBD.json", 'utf8'));
    
    // Encontra o índice do comentário com o id igual ao idComentario
    const comentarioIndex = comentarios.findIndex(comentario => comentario.id === idComentario);
    
    if (comentarioIndex !== -1) {
        // Recupera a lista de curtidas do comentário encontrado
        let curtidas = comentarios[comentarioIndex].curtidas || [];
        
        // Verifica se o usuarioQueCurtiu já está presente nas curtidas
        const usuarioIndex = curtidas.indexOf(usuarioQueCurtiu);
        
        if (usuarioIndex !== -1) {
            // Se o usuário estiver presente, remove-o das curtidas
            curtidas.splice(usuarioIndex, 1);
        } else {
            // Se o usuário não estiver presente, adiciona-o às curtidas
            curtidas.push(usuarioQueCurtiu);
        }
        
        // Atualiza a lista de curtidas no comentário
        comentarios[comentarioIndex].curtidas = curtidas;
        
        // Escreve de volta o array de comentários atualizado no arquivo JSON
        fs.writeFileSync("BD/SocialBD.json", JSON.stringify(comentarios, null, 2), 'utf8');
        console.log("Comentário editado com sucesso:", comentarios[comentarioIndex]);
    } else {
        console.error("Comentário não encontrado:", idComentario);
    }
}

module.exports = {
    adicionarNovoComentario,
    buscarTodosComentarios,
    editarComentario
};