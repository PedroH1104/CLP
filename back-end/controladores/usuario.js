const { getUsuarioPorId, criaUsuario, getTodosUsuarios } = require("../servicos/usuario")

function getUsuarios(req, res){
    try {     
        const usuarios = getTodosUsuarios() 
        res.send(usuarios)
    } catch(error) { 
        res.status(500)
        res.send(error.message)
    }    
}

function getUsuario(req, res){
    try {  
        const id = req.params.id   
        const usuario = getUsuarioPorId(id) 
        res.send(usuario)
    } catch(error) { 
        res.status(500)
        res.send(error.message)
    }   
}

function postUsuario(req, res) {
    try {
        const usuarioNovo = req.body;
        console.log("usuario no controlador: ", usuarioNovo)
        if (req.file) {
            // Substituir as barras invertidas por barras normais
            const caminhoImagem = `uploads/${req.file.filename}`;
            usuarioNovo.imagem = caminhoImagem;
        }
        criaUsuario(usuarioNovo);
        res.status(201).json({
            mensagem: "Usuário criado com sucesso",
            usuario: usuarioNovo
        });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).send(error.message);
    }
}

module.exports = {
   getUsuario,
   postUsuario,
   getUsuarios
}