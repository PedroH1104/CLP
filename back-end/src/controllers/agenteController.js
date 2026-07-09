import { executarAgenteBDI } from "../agents/leitura/bdiAgent.js";
import { transcreverAudio } from "../services/transcricaoAudio.js";
import { agenteLog, usuario } from "../models/index.js";
import fs from "node:fs/promises";

class AgenteController {
	// Entrada textual do agente: recebe a observacao do usuario e delega o ciclo
	// completo para o BDI. O controller apenas persiste o trace para auditoria.
	static async executar(req, res, next) {
		try {
			const { texto, usuarioId, nomeUsuario, confirmar, interpretacaoConfirmada } = req.body;

			if (!texto || !usuarioId) {
				return res.status(400).json({
					sucesso: false,
					mensagem: "Texto e usuarioId sao obrigatorios para executar o agente."
				});
			}

			const resposta = await executarAgenteBDI({
				texto,
				usuarioId,
				nomeUsuario,
				confirmar,
				interpretacaoConfirmada
			});

			console.log("[AgenteController.executar] agente respondeu", {
				acao: resposta.acao,
				origem: resposta.origemInterpretacao,
				sucesso: resposta.sucesso,
				precisaConfirmacao: resposta.precisaConfirmacao || false,
				usouMemoria: resposta.traceBDI?.etapas?.some((etapa) =>
					Boolean(etapa.detalhes?.memoria?.usouPendencia)
				) || false,
				pendenciaAtiva: resposta.pendencia?.ativa || false
			});

			await agenteLog.create({
				usuarioId,
				texto,
				acao: resposta.acao,
				origemInterpretacao: resposta.origemInterpretacao,
				parametros: resposta.parametros,
				sucesso: resposta.sucesso,
				mensagem: resposta.mensagem,
				precisaConfirmacao: resposta.precisaConfirmacao || false,
				traceBDI: resposta.traceBDI,
				pendencia: resposta.pendencia
			});

			res.status(200).json(resposta);
		} catch (error) {
			next(error);
		}
	}

	// Consulta usada pela aba administrativa para mostrar as decisoes registradas.
	static async historico(req, res, next) {
		try {
			const usuarioId = req.query.usuario;
			const isAdmin = req.query.admin === "true";

			if (!usuarioId) {
				return res.status(400).json({
					sucesso: false,
					mensagem: "Informe o usuario para consultar o historico do agente."
				});
			}

			const filtro = isAdmin ? {} : { usuarioId };
			const historico = await agenteLog
				.find(filtro)
				.sort({ data: -1 })
				.limit(isAdmin ? 100 : 20)
				.lean();

			const usuariosIds = [...new Set(historico.map((log) => log.usuarioId).filter(Boolean))];
			const usuarios = await usuario
				.find({ _id: { $in: usuariosIds } }, { nome: 1, email: 1 })
				.lean();

			const usuariosPorId = new Map(
				usuarios.map((item) => [
					item._id.toString(),
					{
						id: item._id.toString(),
						nome: item.nome,
						email: item.email
					}
				])
			);

			const historicoComUsuario = historico.map((log) => ({
				...log,
				usuario: usuariosPorId.get(log.usuarioId) || {
					id: log.usuarioId,
					nome: "Usuario nao encontrado",
					email: ""
				}
			}));

			res.status(200).json(historicoComUsuario);
		} catch (error) {
			next(error);
		}
	}

	// Entrada por voz: transforma o arquivo de audio em texto antes de chamar o agente.
	static async transcrever(req, res, next) {
		try {
			if (!req.file?.path) {
				return res.status(400).json({
					sucesso: false,
					mensagem: "Envie um arquivo de audio no campo audio."
				});
			}

			console.log("[AgenteController.transcrever] audio recebido", {
				nome: req.file.originalname,
				mimetype: req.file.mimetype,
				tamanho: req.file.size
			});

			const resposta = await transcreverAudio(req.file.path, {
				nomeOriginal: req.file.originalname,
				mimeType: req.file.mimetype
			});
			const status = resposta.sucesso ? 200 : 501;
			console.log("[AgenteController.transcrever] resposta transcricao", {
				status,
				sucesso: resposta.sucesso,
				caracteres: resposta.texto?.length || 0
			});

			res.status(status).json(resposta);
		} catch (error) {
			next(error);
		} finally {
			if (req.file?.path) {
				await fs.rm(req.file.path, { force: true });
			}
		}
	}
}

export default AgenteController;
