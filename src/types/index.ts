export interface Question {
  categoria: string;
  pregunta: string;
  respuesta: number;
  rango_min: number;
  rango_max: number;
  informacion: string;
  fuente: string;
  activa: string;
}

export interface Player {
  name: string;
  avatar: string;
  score: number;
  exactHits: number;
  correctHits: number;
  wrongHits: number;
}