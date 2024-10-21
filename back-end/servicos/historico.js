const fs = require("fs")

function adicionarNovoHistorico(novoHistorico){    
    const historicos = JSON.parse(fs.readFileSync("BD/HistoricoBD.json")) 
    const novaListaDeHistoricos = [...historicos, novoHistorico]    
    fs.writeFileSync("BD/HistoricoBD.json", JSON.stringify(novaListaDeHistoricos));
}

function pegarHistoricos(){
    const Historicos = JSON.parse(fs.readFileSync("BD/HistoricoBD.json"))     
    return Historicos
}

function deletarHistoricoDeLivroPOrId(livroId){
    const historicos = JSON.parse(fs.readFileSync("BD/HistoricoBD.json"))
    const historicosFiltrados = historicos.filter(historico => historico.livro !== livroId);    
    fs.writeFileSync('BD/HistoricoBD.json', JSON.stringify(historicosFiltrados));
}

module.exports = {
    adicionarNovoHistorico,
    pegarHistoricos,
    deletarHistoricoDeLivroPOrId
}