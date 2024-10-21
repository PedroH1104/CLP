const { Router } = require("express")
const router = Router()

const { postNovoHistorico, getHistoricos, deleteHistoricoDoLivro } = require("../controladores/historico")

router.post('/criar', postNovoHistorico)
router.get('/', getHistoricos)
router.delete('/:id', deleteHistoricoDoLivro)

module.exports = router