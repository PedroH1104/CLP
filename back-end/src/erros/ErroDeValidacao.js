import RequisicaoIncorreta from "./RequisicaoIncorreta.js";

class ErroDeValidacao extends RequisicaoIncorreta {
	constructor(error) {
		const mensagensErro = Object.values(error.errors).map(error => error.message).join("; ");
		super(`Os seguintes erros foram encontrados: ${mensagensErro}`);
	}
}

export default ErroDeValidacao;