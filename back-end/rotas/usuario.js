const { Router } = require("express");
const router = Router();
const upload = require("../config/multerConfig"); // Caminho para o arquivo de configuração do multer
const { getUsuario, postUsuario, getUsuarios } = require("../controladores/usuario");

// Rotas
router.get('/', getUsuarios);
router.get('/:id', getUsuario);

// Rota para criar um usuário com upload de imagem
router.post('/criar', upload.single('imagem'), postUsuario);

module.exports = router;