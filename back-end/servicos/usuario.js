const fs = require("fs")

function getTodosUsuarios(){
    return JSON.parse(fs.readFileSync("BD/UsuariosBD.json"))  
}

function getUsuarioPorId(id){
    const usuarios = JSON.parse(fs.readFileSync("BD/UsuariosBD.json"))  
    const usuarioFiltrado = usuarios.filter( usuario => usuario.id === id ) [0] // como só vai ter um livro com cada ID, sempre só vai ter uma resposta, indice 0
    return usuarioFiltrado
}

function criaUsuario(usuarioNovo){  
    console.log('Dados recebidos para criação do usuário:', usuarioNovo);
    const usuariosAtuais = JSON.parse(fs.readFileSync("BD/UsuariosBD.json"))     
    const novosUsuarios = [...usuariosAtuais, usuarioNovo]
    fs.writeFileSync("BD/UsuariosBD.json", JSON.stringify(novosUsuarios))
}

function getNomeDoUsuario(id){
    const usuariosAtuais = JSON.parse(fs.readFileSync("BD/UsuariosBD.json")) 
    const usuarioFiltrado = usuariosAtuais.filter( usuario => usuario.id === id ) [0]
    return usuarioFiltrado.nome
}

module.exports = {
    getUsuarioPorId,
    criaUsuario,
    getTodosUsuarios,
    getNomeDoUsuario
}