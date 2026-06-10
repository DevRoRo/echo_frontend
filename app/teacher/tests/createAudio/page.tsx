"use client";

import { useState } from "react";
import { useLTIContext } from "@/contexts/LTIContext";

export default function CreateAudioPage() {
    const { sessionToken } = useLTIContext();
    const [prompt, setPrompt] = useState("");
    const [voiceName, setVoiceName] = useState("Aoede");
    const [conversationContext, setConversationContext] = useState("");

    const [wordCount, setWordCount] = useState(80);
    const [generationMode, setGenerationMode] = useState<"direct" | "ai">("ai");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [audioFile, setAudioFile] = useState<{
        url: string;
        filename: string;
        filePath: string;
        aiText?: string;
    } | null>(null);
    const [audioName, setAudioName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setAudioFile(null);

        const endpoint =
            generationMode === "direct" ? "/generate-audio/" : "/ask-professor/";

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };
            if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;

            const response = await fetch(`${baseUrl}${endpoint}`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    prompt: prompt,
                    voice_name: voiceName,
                    conversation_context: conversationContext,
                    ...(generationMode === "ai" && { word_count: wordCount }),
                }),
            });

            if (!response.ok) {
                if (response.status === 422) {
                    const errorData = await response.json();
                    console.error("Erro 422 (Validação):", errorData);
                    throw new Error("Erro de validação: Verifique se todos os campos foram preenchidos corretamente.");
                }
                const errorBody = await response.json().catch(() => null);
                const detail = errorBody?.detail || await response.text().catch(() => "");
                throw new Error(detail || "Falha ao gerar o áudio. Verifique a conexão com a API.");
            }

            const data = await response.json();

            if (!data.file_path) {
                throw new Error("Caminho do áudio não encontrado na resposta.");
            }

            const filePath: string = data.file_path;
            const filename = filePath.split("/").pop() || filePath;

            const defaultName = (data.ai_text || prompt).slice(0, 60);
            setAudioName(defaultName);

            setAudioFile({
                url: `${baseUrl}/${filePath}`,
                filename,
                filePath,
                aiText: data.ai_text,
            });
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Erro desconhecido");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!audioFile) return;
        setIsSaving(true);
        setSaveError(null);
        setSaveSuccess(false);

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };
            if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;

            const response = await fetch(`${baseUrl}/audio-records/`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    name: audioName,
                    file_path: audioFile.filePath,
                    transcription: audioFile.aiText || prompt,
                    conversation_context: conversationContext,
                    voice_name: voiceName,
                }),
            });

            if (!response.ok) {
                if (response.status === 422) {
                    const errorData = await response.json();
                    console.error("Erro 422 (Validação):", errorData);
                    throw new Error("Erro de validação: Verifique os dados do registro.");
                }
                const errorBody = await response.json().catch(() => null);
                const detail = errorBody?.detail || await response.text().catch(() => "");
                throw new Error(detail || "Falha ao salvar o registro. Verifique a conexão com a API.");
            }

            setSaveSuccess(true);
        } catch (err: unknown) {
            setSaveError(err instanceof Error ? err.message : "Erro desconhecido");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="create-audio__page">
            <h1 className="create-audio__heading">
                Criar Novo Áudio
            </h1>

            <form onSubmit={handleSubmit} className="create-audio__form">
                <div className="create-audio__radio-group">
                    <label className="create-audio__radio-label">
                        <input
                            type="radio"
                            name="mode"
                            value="ai"
                            checked={generationMode === "ai"}
                            onChange={() => setGenerationMode("ai")}
                            className="create-audio__radio-input"
                        />
                        <span>Contexto com IA (/ask-professor/)</span>
                    </label>
                    <label className="create-audio__radio-label">
                        <input
                            type="radio"
                            name="mode"
                            value="direct"
                            checked={generationMode === "direct"}
                            onChange={() => setGenerationMode("direct")}
                            className="create-audio__radio-input"
                        />
                        <span>Texto Direto (/generate-audio/)</span>
                    </label>
                </div>

                <div>
                    <label htmlFor="voiceName" className="form-label">
                        Voz do Áudio
                    </label>
                    <select
                        id="voiceName"
                        value={voiceName}
                        onChange={(e) => setVoiceName(e.target.value)}
                        className="form-select"
                    >
                        <option value="Aoede">Aoede (Feminina)</option>
                        <option value="Kore">Kore (Feminina)</option>
                        <option value="Puck">Puck (Masculina)</option>
                        <option value="Charon">Charon (Masculina)</option>
                        <option value="Fenrir">Fenrir (Masculina)</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="context" className="form-label">
                        Contexto da Conversação (Background/Cenário)
                    </label>
                    <input
                        type="text"
                        id="context"
                        value={conversationContext}
                        onChange={(e) => setConversationContext(e.target.value)}
                        required
                        placeholder="Ex: Em um restaurante, Nível B1, tom formal..."
                        className="form-input"
                    />
                </div>

                {generationMode === "ai" && (
                    <div>
                        <label htmlFor="wordCount" className="form-label">
                            Número de palavras para a resposta
                        </label>
                        <input
                            type="number"
                            id="wordCount"
                            min={1}
                            max={500}
                            value={wordCount}
                            onChange={(e) => setWordCount(Math.max(1, parseInt(e.target.value) || 1))}
                            className="form-input"
                        />
                    </div>
                )}

                <div>
                    <label htmlFor="prompt" className="form-label">
                        {generationMode === "ai"
                            ? "Instruções específicas para a IA (O que os personagens devem falar)"
                            : "Texto exato para leitura"}
                    </label>
                    <textarea
                        id="prompt"
                        rows={4}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        required
                        className="form-textarea"
                        placeholder="Digite aqui..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !prompt.trim() || !conversationContext.trim() || (generationMode === "ai" && wordCount < 1)}
                    className={
                        `create-audio__btn-submit${
                            isLoading || !prompt.trim() || !conversationContext.trim() || (generationMode === "ai" && wordCount < 1)
                                ? " create-audio__btn-submit--disabled"
                                : ""
                        }`
                    }
                >
                    {isLoading ? "Processando..." : "Gerar Áudio"}
                </button>
            </form>

            {error && (
                <div className="error-box">
                    {error}
                </div>
            )}

            {audioFile && (
                <div className="create-audio__result">
                    <h2 className="create-audio__result-heading">Áudio Gerado</h2>

                    {audioFile.aiText && (
                        <div className="create-audio__ai-text">
                            <span className="ai-text__label">Texto gerado pela IA:</span>
                            <p className="ai-text__content">{audioFile.aiText}</p>
                        </div>
                    )}

                    <audio controls className="create-audio__audio-player" src={audioFile.url}>
                        Seu navegador não suporta o elemento de áudio.
                    </audio>

                    <div className="create-audio__file-details">
                        <div>
                            <span className="file-details__label">Nome do arquivo:</span>{" "}
                            {audioFile.filename}
                        </div>
                        <div>
                            <span className="file-details__label">URL:</span>{" "}
                            <a
                                href={audioFile.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="create-audio__file-details__url"
                            >
                                {audioFile.url}
                            </a>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="audioName" className="form-label">
                            Nome do Áudio
                        </label>
                        <input
                            type="text"
                            id="audioName"
                            value={audioName}
                            onChange={(e) => setAudioName(e.target.value)}
                            required
                            placeholder="Ex: Diálogo no Restaurante"
                            className="form-input"
                        />
                    </div>

                    <div className="create-audio__actions">
                        <button className="btn-save" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? "Salvando..." : "Salvar Áudio no Banco de Dados"}
                        </button>
                    </div>

                    {saveSuccess && (
                        <div className="create-audio__save-success">
                            Registro salvo com sucesso!
                        </div>
                    )}

                    {saveError && (
                        <div className="error-box">
                            {saveError}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
