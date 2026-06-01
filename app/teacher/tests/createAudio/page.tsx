"use client";

import { useState } from "react";

export default function CreateAudioPage() {
    // 1. Updated State to match backend requirements
    const [prompt, setPrompt] = useState("");
    const [voiceName, setVoiceName] = useState("en-US-Journey-F"); // Default voice
    const [conversationContext, setConversationContext] = useState("");

    const [generationMode, setGenerationMode] = useState<"direct" | "ai">("ai");
    const [isLoading, setIsLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setAudioUrl(null);

        const endpoint =
            generationMode === "direct" ? "/generate-audio/" : "/ask-professor/";

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

            const response = await fetch(`${baseUrl}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                // 2. The Payload now perfectly matches your Pydantic BaseModel
                body: JSON.stringify({
                    prompt: prompt,
                    voice_name: voiceName,
                    conversation_context: conversationContext
                }),
            });

            if (!response.ok) {
                // If we get a 422, we can try to parse the detail for better debugging
                if (response.status === 422) {
                    const errorData = await response.json();
                    console.error("Erro 422 (Validação):", errorData);
                    throw new Error("Erro de validação: Verifique se todos os campos foram preenchidos corretamente.");
                }
                throw new Error("Falha ao gerar o áudio. Verifique a conexão com a API.");
            }

            const data = await response.json();

            if (data.audio_url) {
                setAudioUrl(data.audio_url);
            } else {
                throw new Error("URL do áudio não encontrada na resposta.");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                Criar Novo Áudio de Teste
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Mode Selector */}
                <div className="flex space-x-4 mb-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="radio"
                            name="mode"
                            value="ai"
                            checked={generationMode === "ai"}
                            onChange={() => setGenerationMode("ai")}
                            className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">Contexto com IA (/ask-professor/)</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="radio"
                            name="mode"
                            value="direct"
                            checked={generationMode === "direct"}
                            onChange={() => setGenerationMode("direct")}
                            className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">Texto Direto (/generate-audio/)</span>
                    </label>
                </div>

                {/* 3. New Input: Voice Selection */}
                <div>
                    <label htmlFor="voiceName" className="block text-sm font-medium text-gray-700 mb-2">
                        Voz do Áudio
                    </label>
                    <select
                        id="voiceName"
                        value={voiceName}
                        onChange={(e) => setVoiceName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="Aoede">Aoede (Feminina)</option>
                        <option value="Kore">Kore (Feminina)</option>
                        <option value="Puck">Puck (Masculina)</option>
                        <option value="Charon">Charon (Masculina)</option>
                        <option value="Fenrir">Fenrir (Masculina)</option>
                    </select>
                </div>

                {/* 4. New Input: Conversation Context */}
                <div>
                    <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-2">
                        Contexto da Conversação (Background/Cenário)
                    </label>
                    <input
                        type="text"
                        id="context"
                        value={conversationContext}
                        onChange={(e) => setConversationContext(e.target.value)}
                        required
                        placeholder="Ex: Em um restaurante, Nível B1, tom formal..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                {/* Original Text Input (Prompt) */}
                <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Digite aqui..."
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading || !prompt.trim() || !conversationContext.trim()}
                    className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${isLoading || !prompt.trim() || !conversationContext.trim()
                            ? "bg-blue-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                >
                    {isLoading ? "Processando..." : "Gerar Áudio"}
                </button>
            </form>

            {/* Error Message */}
            {error && (
                <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            {/* Result Player */}
            {audioUrl && (
                <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Áudio Gerado:</h2>
                    <audio controls className="w-full" src={audioUrl}>
                        Seu navegador não suporta o elemento de áudio.
                    </audio>
                    <div className="mt-4 flex justify-end">
                        <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                            Salvar Teste no Banco de Dados
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}