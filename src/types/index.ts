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
  id?: string; // Socket ID for online players
  name: string;
  avatar: string;
  score: number;
  isHost?: boolean; // Flag for online host
  exactHits: number;
  correctHits: number;
  wrongHits: number;
  totalTimeUsed: number;
}