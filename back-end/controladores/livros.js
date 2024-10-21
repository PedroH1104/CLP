const {getLivrosDoUsuarioPorId, adicionarNovoLivro, editarLivro, deletarLivro, buscarTodosLivros} = require("../servicos/livros")

function getTodosLivros(req, res) {
    try {          
        const todosLivros = buscarTodosLivros() 
        res.send(todosLivros)
    } catch(error) { 
        res.status(500)
        res.send(error.message)
    }  
}

function getLivrosDoUsuario(req, res) {
    try {  
        const id = req.params.id   
        const livrosDoUsuario = getLivrosDoUsuarioPorId(id) 
        res.send(livrosDoUsuario)
    } catch(error) { 
        res.status(500)
        res.send(error.message)
    }   
}

function postNovoLivro(req, res) {
    try {          
        const livroNovo = req.body
        adicionarNovoLivro(livroNovo)
        res.status(201)
        res.send("Livro criado com sucesso")
    } catch(error) { 
        res.status(500)
        res.send(error.message)
    }   
}

function putLivro(req, res){
    try {          
        const idLivro = req.params.id 
        const livroComModificacoes = req.body  
        editarLivro(idLivro, livroComModificacoes)
        res.status(201)
        res.send("Livro editado com sucesso")
    } catch(error) { 
        res.status(500)
        res.send(error.message)
    }
}

function deleteLivro(req, res){
    try {          
        const idLivro = req.params.id        
        deletarLivro(idLivro)
        res.status(201)
        res.send("Livro excluido com sucesso")
    } catch(error) { 
        res.status(500)
        res.send(error.message)
    }   
}

module.exports = {
    getLivrosDoUsuario,
    postNovoLivro,
    putLivro,
    deleteLivro,
    getTodosLivros
}

 