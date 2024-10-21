const { Router } = require("express")
const router = Router()

const {postNovoComentario, getTodosComentarios, putComentario} = require("../controladores/social")

router.post('/adicionarComentario', postNovoComentario)
router.get('/', getTodosComentarios)
router.put('/editarCurtida/:id', putComentario)


module.exports = router