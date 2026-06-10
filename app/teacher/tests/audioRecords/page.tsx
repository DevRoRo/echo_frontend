"use client";

import React, { useState } from "react";
import { useLTIContext } from "@/contexts/LTIContext";

interface AudioRecord {
    id: number;
    name: string;
    file_path: string;
    transcription: string;
    conversation_context: string | null;
    voice_name: string;
    created_at: string;
}

export default function AudioRecordsPage() {
    const { sessionToken } = useLTIContext();
    const [transcriptionFilter, setTranscriptionFilter] = useState("");
    const [contextFilter, setContextFilter] = useState("");
    const [voiceFilter, setVoiceFilter] = useState("");

    const [records, setRecords] = useState<AudioRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setHasSearched(true);
        setExpandedId(null);
        setDeleteError(null);

        try {
            const params = new URLSearchParams();
            if (transcriptionFilter.trim()) params.set("transcription", transcriptionFilter.trim());
            if (contextFilter.trim()) params.set("conversation_context", contextFilter.trim());
            if (voiceFilter.trim()) params.set("voice_name", voiceFilter.trim());

            const queryString = params.toString();
            const url = `${baseUrl}/audio-records/${queryString ? `?${queryString}` : ""}`;

            const headers: Record<string, string> = {};
            if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;

            const response = await fetch(url, { headers });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => null);
                const detail = errorBody?.detail || await response.text().catch(() => "");
                throw new Error(detail || "Falha ao buscar registros. Verifique a conexão com a API.");
            }

            const data: AudioRecord[] = await response.json();
            setRecords(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Erro desconhecido");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
        setDeleteError(null);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Tem certeza que deseja excluir este áudio?")) return;

        setDeletingId(id);
        setDeleteError(null);

        try {
            const headers: Record<string, string> = {};
            if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;

            const response = await fetch(`${baseUrl}/audio-records/${id}`, {
                method: "DELETE",
                headers,
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => null);
                const detail = errorBody?.detail || await response.text().catch(() => "");
                throw new Error(detail || "Falha ao excluir o registro.");
            }

            setRecords((prev) => prev.filter((r) => r.id !== id));
            if (expandedId === id) setExpandedId(null);
        } catch (err: unknown) {
            setDeleteError(err instanceof Error ? err.message : "Erro desconhecido");
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString("pt-BR");
    };

    const truncate = (text: string | null, max: number) => {
        if (!text) return "—";
        return text.length > max ? `${text.slice(0, max)}...` : text;
    };

    return (
        <div className="audio-records__page">
            <h1 className="audio-records__heading">
                Registros de Áudio
            </h1>

            <form onSubmit={handleSearch} className="audio-records__form">
                <div className="audio-records__form-row">
                    <div className="audio-records__form-group">
                        <label htmlFor="transcriptionFilter" className="form-label">
                            Transcrição
                        </label>
                        <input
                            type="text"
                            id="transcriptionFilter"
                            value={transcriptionFilter}
                            onChange={(e) => setTranscriptionFilter(e.target.value)}
                            placeholder="Filtrar por transcrição..."
                            className="form-input"
                        />
                    </div>

                    <div className="audio-records__form-group">
                        <label htmlFor="contextFilter" className="form-label">
                            Contexto
                        </label>
                        <input
                            type="text"
                            id="contextFilter"
                            value={contextFilter}
                            onChange={(e) => setContextFilter(e.target.value)}
                            placeholder="Filtrar por contexto..."
                            className="form-input"
                        />
                    </div>

                    <div className="audio-records__form-group">
                        <label htmlFor="voiceFilter" className="form-label">
                            Voz
                        </label>
                        <select
                            id="voiceFilter"
                            value={voiceFilter}
                            onChange={(e) => setVoiceFilter(e.target.value)}
                            className="form-select"
                        >
                            <option value="">Todas</option>
                            <option value="Aoede">Aoede</option>
                            <option value="Kore">Kore</option>
                            <option value="Puck">Puck</option>
                            <option value="Charon">Charon</option>
                            <option value="Fenrir">Fenrir</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="audio-records__btn-search"
                        style={{ marginBottom: 0 }}
                    >
                        {isLoading ? "Buscando..." : "Buscar"}
                    </button>
                </div>
            </form>

            {error && (
                <div className="error-box">
                    {error}
                </div>
            )}

            {isLoading && (
                <div className="audio-records__loading">
                    Carregando registros...
                </div>
            )}

            {!isLoading && hasSearched && records.length === 0 && (
                <div className="audio-records__empty">
                    Nenhum registro encontrado.
                </div>
            )}

            {!isLoading && records.length > 0 && (
                <table className="audio-records__table">
                    <thead>
                        <tr>
                            <th className="audio-records__table-header">Nome</th>
                            <th className="audio-records__table-header">Transcrição</th>
                            <th className="audio-records__table-header">Contexto</th>
                            <th className="audio-records__table-header">Voz</th>
                            <th className="audio-records__table-header">Criado em</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((record) => (
                            <React.Fragment key={record.id}>
                                <tr
                                    className={`audio-records__table-row audio-records__table-row--clickable${
                                        expandedId === record.id
                                            ? " audio-records__table-row--expanded"
                                            : ""
                                    }`}
                                    onClick={() => toggleExpand(record.id)}
                                >
                                    <td className="audio-records__table-cell">
                                        {truncate(record.name, 40)}
                                    </td>
                                    <td className="audio-records__table-cell">
                                        {truncate(record.transcription, 60)}
                                    </td>
                                    <td className="audio-records__table-cell audio-records__table-cell--muted">
                                        {truncate(record.conversation_context, 60)}
                                    </td>
                                    <td className="audio-records__table-cell">
                                        {record.voice_name}
                                    </td>
                                    <td className="audio-records__table-cell audio-records__table-cell--muted">
                                        {formatDate(record.created_at)}
                                    </td>
                                </tr>

                                {expandedId === record.id && (
                                    <tr className="audio-records__expand-row">
                                        <td
                                            className="audio-records__expand-cell"
                                            colSpan={5}
                                        >
                                            <div className="audio-records__detail-panel">
                                                <div className="audio-records__detail-field">
                                                    <span className="audio-records__detail-label">Nome:</span>
                                                    <span className="audio-records__detail-value">{record.name}</span>
                                                </div>

                                                <div className="audio-records__detail-field">
                                                    <span className="audio-records__detail-label">Transcrição:</span>
                                                    <span className="audio-records__detail-value">{record.transcription}</span>
                                                </div>

                                                <div className="audio-records__detail-field">
                                                    <span className="audio-records__detail-label">Contexto:</span>
                                                    <span className="audio-records__detail-value">
                                                        {record.conversation_context || "—"}
                                                    </span>
                                                </div>

                                                <div className="audio-records__detail-field">
                                                    <span className="audio-records__detail-label">Arquivo:</span>
                                                    <span className="audio-records__detail-value">{record.file_path}</span>
                                                </div>

                                                <div className="audio-records__detail-field">
                                                    <span className="audio-records__detail-label">Voz:</span>
                                                    <span className="audio-records__detail-value">{record.voice_name}</span>
                                                </div>

                                                <div className="audio-records__detail-field">
                                                    <span className="audio-records__detail-label">Criado em:</span>
                                                    <span className="audio-records__detail-value">{formatDate(record.created_at)}</span>
                                                </div>

                                                <div className="audio-records__detail-actions">
                                                    <audio
                                                        controls
                                                        className="audio-records__audio-player"
                                                        src={`${baseUrl}/${record.file_path}`}
                                                    >
                                                        Seu navegador não suporta o elemento de áudio.
                                                    </audio>

                                                    <button
                                                        className="audio-records__btn-delete"
                                                        onClick={() => handleDelete(record.id)}
                                                        disabled={deletingId === record.id}
                                                    >
                                                        {deletingId === record.id ? "Excluindo..." : "Excluir Áudio"}
                                                    </button>
                                                </div>

                                                {deleteError && (
                                                    <div className="error-box" style={{ marginTop: "var(--spacing-3)" }}>
                                                        {deleteError}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
