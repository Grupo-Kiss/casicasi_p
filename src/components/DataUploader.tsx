import React, { useState, useCallback } from 'react';
import { Question } from '../types';
import { useQuestionsContext } from '../hooks/QuestionsContext';
import { isQuestion, coerceQuestion } from '../utils/questionValidation'; // Importar funciones de validación
import '../styles/DataUploader.css'; // Importar estilos

interface Stats {
  total: number;
  categories: Record<string, number>;
  valid: number;
  corrected: number;
  invalid: number;
}

const DataUploader: React.FC = () => {
  const { setQuestions } = useQuestionsContext();
  const [file, setFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<any[] | null>(null);
  const [cleansedData, setCleansedData] = useState<Question[] | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetState = () => {
    setFile(null);
    setRawData(null);
    setCleansedData(null);
    setStats(null);
    setError(null);
    setSuccess(null);
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    resetState();
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      setFile(selectedFile);
    }
  }, []);

  const analyzeFile = useCallback(() => {
    if (!file) {
      setError('Por favor, selecciona un archivo primero.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error('No se pudo leer el archivo.');

        const data = JSON.parse(text);
        if (!Array.isArray(data)) throw new Error('El JSON debe ser un array.');

        setRawData(data);

        const categories: Record<string, number> = {};
        data.forEach(item => {
          const category = item.categoria?.toString() || 'Sin Categoria';
          categories[category] = (categories[category] || 0) + 1;
        });

        const originalValidCount = data.filter(isQuestion).length;

        setStats({ total: data.length, categories, valid: originalValidCount, corrected: 0, invalid: 0 });
        setSuccess('Análisis completado. Revisa las estadísticas y procede a depurar.');
        setError(null);

      } catch (err: any) {
        setError(`Error de formato: ${err.message}`);
        setSuccess(null);
      }
    };
    reader.readAsText(file);
  }, [file]);

  const cleanseAndValidateData = useCallback(() => {
    if (!rawData) {
      setError('Debes analizar el archivo primero.');
      return;
    }

    const coercedData = rawData.map(coerceQuestion).filter(Boolean) as Question[];
    const correctedCount = coercedData.length - (stats?.valid || 0);
    const invalidCount = rawData.length - coercedData.length;

    setCleansedData(coercedData);
    setStats(prev => prev ? { ...prev, corrected: correctedCount > 0 ? correctedCount : 0, invalid: invalidCount } : null);

    let successMsg = `Depuración completada. Total de preguntas válidas para cargar: ${coercedData.length}.`;
    if (correctedCount > 0) {
      successMsg += ` Se corrigieron ${correctedCount} registros.`;
    }
    if (invalidCount > 0) {
      successMsg += ` Se descartaron ${invalidCount} registros irreparables.`;
    }
    setSuccess(successMsg);
    setError(null);
  }, [rawData, stats?.valid]);

  const handleLoad = useCallback(() => {
    if (!cleansedData) {
      setError('Primero depura y valida los datos antes de cargarlos.');
      return;
    }
    setQuestions(cleansedData);
    setSuccess('¡Nuevas preguntas cargadas exitosamente!');
  }, [cleansedData, setQuestions]);

  return (
    <div className="data-uploader-container">
      <header className="data-uploader-header">
        <h1>Depuración y Carga de Datos</h1>
        <p>Sigue los pasos para analizar, depurar y cargar un nuevo archivo de preguntas.</p>
      </header>

      <section className="data-uploader-section">
        <input type="file" accept=".json" onChange={handleFileChange} />
      </section>

      <section className="data-uploader-section buttons">
        <button className="data-uploader-button" onClick={analyzeFile} disabled={!file}>1. Analizar Archivo</button>
        <button className="data-uploader-button" onClick={cleanseAndValidateData} disabled={!rawData}>2. Depurar y Validar</button>
        <button className="data-uploader-button bold" onClick={handleLoad} disabled={!cleansedData}>3. Cargar Datos</button>
      </section>

      {stats && (
        <section className="data-uploader-section stats">
          <h2>Estadísticas del Archivo</h2>
          <p><strong>Total de registros encontrados:</strong> {stats.total}</p>
          <p><strong>Registros Válidos Originales:</strong> {stats.valid}</p>
          {stats.corrected > 0 && <p style={{color: 'blue'}}><strong>Registros Corregidos:</strong> {stats.corrected}</p>}
          {stats.invalid > 0 && <p style={{color: 'orange'}}><strong>Registros Irreparables (descartados):</strong> {stats.invalid}</p>}
          <p style={{color: 'green'}}><strong>Total Válido para Cargar:</strong> {stats.valid + stats.corrected}</p>
          <strong>Desglose por categoría (original):</strong>
          <ul>
            {Object.entries(stats.categories).map(([cat, count]) => (
              <li key={cat}>{cat}: {count}</li>
            ))}
          </ul>
        </section>
      )}

      <footer className="data-uploader-footer">
        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}
      </footer>
    </div>
  );
};

export default DataUploader;