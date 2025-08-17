import { Question } from '../types';

// Función de validación estricta
export const isQuestion = (obj: any): obj is Question => {
  return (
    typeof obj.categoria === 'string' &&
    typeof obj.pregunta === 'string' &&
    typeof obj.respuesta === 'number' &&
    typeof obj.rango_min === 'number' &&
    typeof obj.rango_max === 'number' &&
    typeof obj.informacion === 'string' &&
    typeof obj.fuente === 'string' &&
    typeof obj.activa === 'string'
  );
};

// Función de corrección y coerción
export const coerceQuestion = (obj: any): Question | null => {
  if (!obj || typeof obj !== 'object') return null;

  const pregunta = obj.pregunta?.toString();
  if (!pregunta) return null; // La pregunta es indispensable

  const respuesta = parseInt(obj.respuesta, 10);
  if (isNaN(respuesta)) return null; // La respuesta numérica es indispensable

  const rango_min = parseInt(obj.rango_min, 10);
  const rango_max = parseInt(obj.rango_max, 10);

  return {
    pregunta,
    respuesta,
    categoria: obj.categoria?.toString() || 'Sin Categoría',
    rango_min: isNaN(rango_min) ? respuesta - 10 : rango_min, // Default si no es válido
    rango_max: isNaN(rango_max) ? respuesta + 10 : rango_max, // Default si no es válido
    informacion: obj.informacion?.toString() || '',
    fuente: obj.fuente?.toString() || '',
    activa: obj.activa?.toString().toUpperCase() || 'SI',
  };
};
