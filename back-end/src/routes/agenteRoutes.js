import express from "express";
import multer from "multer";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import AgenteController from "../controllers/agenteController.js";

const routes = express.Router();
const pastaTemporaria = path.join(os.tmpdir(), "clp-audios");
const limiteAudioBytes = Number(process.env.AUDIO_MAX_BYTES) || 5 * 1024 * 1024;

fs.mkdirSync(pastaTemporaria, { recursive: true });

const upload = multer({
	dest: pastaTemporaria,
	limits: {
		fileSize: limiteAudioBytes
	}
});

routes.post("/agente/executar", AgenteController.executar);
routes.post("/agente/transcrever", upload.single("audio"), AgenteController.transcrever);
routes.get("/agente/historico", AgenteController.historico);

export default routes;
