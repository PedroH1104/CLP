const fs = require("fs")

function buscarTodosLivros(){
    const todosLivros = JSON.parse(fs.readFileSync("BD/LivrosBD.json")) 
    return todosLivros
}

function getLivrosDoUsuarioPorId(id){
    const livros = JSON.parse(fs.readFileSync("BD/LivrosBD.json")) 
    const livrosDoUsuario = livros.filter( livro => livro.UserId === id )
    return livrosDoUsuario
}

function adicionarNovoLivro(novoLivro){    
    const livros = JSON.parse(fs.readFileSync("BD/LivrosBD.json")) 
    const novaListaDeLivros = [...livros, novoLivro]    
    fs.writeFileSync("BD/LivrosBD.json", JSON.stringify(novaListaDeLivros));
}

function editarLivro(idLivro, livroComModificacoes){
    let livros = JSON.parse(fs.readFileSync("BD/LivrosBD.json"))
    const indiceDoLivro = livros.findIndex(livro => livro.livro_id === idLivro)
    livros[indiceDoLivro] = livroComModificacoes
    fs.writeFileSync("BD/LivrosBD.json", JSON.stringify(livros));
}

function deletarLivro(idLivro){
    let livros = JSON.parse(fs.readFileSync("BD/LivrosBD.json"))
    livros = livros.filter(livro => livro.livro_id !== idLivro);    
    fs.writeFileSync("BD/LivrosBD.json", JSON.stringify(livros));
}

module.exports = {
    getLivrosDoUsuarioPorId,
    adicionarNovoLivro,
    editarLivro,
    deletarLivro,
    buscarTodosLivros
}