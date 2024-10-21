const { Router } = require("express")
const router = Router()

const { getLivrosDoUsuario, postNovoLivro, putLivro, deleteLivro, getTodosLivros } = require("../controladores/livros")

router.get('/', getTodosLivros)
router.get('/:id', getLivrosDoUsuario)
router.post('/adicionar', postNovoLivro)
router.put('/editar/:id', putLivro)
router.delete('/deletar/:id', deleteLivro)

module.exports = router