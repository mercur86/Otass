import { ObjetoTipo } from "./objeto.tipo";

export class Periodo {
    anioActual?: string;
    mesActual?: string;
    listaAnio: ObjetoTipo[];
    listaMes: ObjetoTipo[];
    constructor() {
        this.listaAnio = [];
        this.listaMes = []; 
    }
}