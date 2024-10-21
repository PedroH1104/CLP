const { adicionarNovoHistorico, pegarHistoricos, deletarHistoricoDeLivroPOrId } = require("../servicos/historico")

function postNovoHistorico(req, res) {
    try {
        const historicoNovo = req.body
        adicionarNovoHistorico(historicoNovo)
        res.status(201)
        res.send("Historico criado com sucesso")
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

function getHistoricos(req, res){
    try {           
        const historico = pegarHistoricos() 
        res.send(historico)
    } catch(error) { 
        res.status(500)
        res.send(error.message)
    }   
}

function deleteHistoricoDoLivro(req, res){
    try { 
        const id = req.params.id
        deletarHistoricoDeLivroPOrId(id)
        res.send("Historico de livro deletado com sucesso!")
    } catch(error) { 
        res.status(500)
        res.send("mensagem de erro", error.message)
    }
}

module.exports = {
    postNovoHistorico,
    getHistoricos,
    deleteHistoricoDoLivro
}