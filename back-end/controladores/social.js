const { adicionarNovoComentario, buscarTodosComentarios, editarComentario } = require("../servicos/social")

function postNovoComentario(req, res) {
    try {
        const comentarioNovo = req.body
        adicionarNovoComentario(comentarioNovo)
        res.status(201)
        res.send("comentário criado com sucesso")
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

function getTodosComentarios(req, res){
    try {          
        const todosComentarios = buscarTodosComentarios() 
        res.send(todosComentarios)
    } catch(error) { 
        res.status(500)
        res.send(error.message)
    }  
}


function putComentario(req, res){
    try {          
        const idComentario = req.params.id 
        const usuarioQueCurtiu = req.body.usuarioID         
        editarComentario(idComentario, usuarioQueCurtiu)
        res.status(201)
        res.send("Interação de like feita com sucesso")
    } catch(error) { 
        res.status(500)
        res.send(error.message)
    }
}


module.exports = {
    postNovoComentario,
    getTodosComentarios,
    putComentario
}