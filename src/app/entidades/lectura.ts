import { Archivo } from "./archivo";

export class Lectura {
    public numHistoricoLectura?: number|null;
    public numInscripcion?: number|null;
    public lecturaMayor?: number|null;
    public lecturaMenor?: number|null;
    public fechaLectura?: string|null;
    public longitud?: number|null;
    public latitud?: number|null;
    public idTipoLectura?: number|null;
    public idObservacion?: number|null;
    public idImpedimento?: number|null;
    public idTipoCritica?: number|null;
    public lecturaCriticada?: number|null;
    public usuarioId?: string|null;
    public archivos: Archivo[];

    constructor() {
        this.numHistoricoLectura = null;
        this.lecturaMayor = null;
        this.lecturaMenor = null;
        this.idObservacion = null;
        this.idImpedimento = null;
        this.idTipoCritica = 0;
        this.usuarioId = null;
        this.archivos = [];
        this.lecturaCriticada = null;
    }
}