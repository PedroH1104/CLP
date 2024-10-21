const express = require("express");
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const rotaUsuario = require("./rotas/usuario");
const rotaLivros = require ("./rotas/livros");
const rotaHistorico = require("./rotas/historico");
const rotaSocial = require("./rotas/social");

// Verificar e criar diretório 'uploads' se não existir
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(uploadDir));

app.use('/usuarios', rotaUsuario);
app.use('/livros', rotaLivros);
app.use('/historico', rotaHistorico);
app.use('/social', rotaSocial);

app.listen(port, () => {
    console.log(`Escutando a porta ${port}`);
});