import { Component, ViewChild } from '@angular/core';
import { Catastro } from '../objetos/Catastro';
import { Cliente } from '../objetos/Cliente';
import { PredioDireccion } from '../objetos/PredioDireccion';
import { PredioDatos } from '../objetos/PredioDatos';
import { DatosSuministro } from '../objetos/DatosSuministro';
import { ConexionAgua } from '../objetos/ConexionAgua';
import { DatosMedidor } from '../objetos/DatosMedidor';
import { DatosDesague } from '../objetos/DatosDesague';
import { Provincia } from '../entidades/Provincia';
import { Distrito } from '../entidades/Distrito';
import { HttpClient } from '@angular/common/http';
import { Entrevistado } from '../objetos/Entrevistado';
import { Encuetador } from '../objetos/Encustador';
import { Zonas } from '../entidades/Zonas';
import { Vias } from '../entidades/Vias';
import { ValoresMaximos } from '../objetos/ValoresMaximos';
@Component({
  selector: 'app-explore-container',
  templateUrl: './explore-container.component.html',
  styleUrls: ['./explore-container.component.scss'],
})
export class ExploreContainerComponent {

   //poper
   @ViewChild('popover') popover:any;
   isOpen = false;
   @ViewChild('popover1') popover1:any;
   isOpen1 = false;
   @ViewChild('popover2') popover2:any;
   isOpen2 = false;
   @ViewChild('popover3') popover3:any;
   isOpen3 = false;
   @ViewChild('popover4') popover4:any;
   isOpen4 = false;
   @ViewChild('popover5') popover5:any;
   isOpen5 = false;
   presentPopover(e: Event) {
     this.codNuevoCatastro.idDistrito ='';
     this.distritos=[];
     this.popover.event = e;
     this.isOpen = true;
   }
   presentPopover1(e: Event) {
     this.popover1.event = e;
     this.isOpen1 = true;
   }

   presentPopover2(e: any) { // provicias
    this.popover2.event = e;
    this.isOpen2 = true;
  }
  presentPopover3(e: Event) {
    this.popover3.event = e;
    this.isOpen3 = true;
  }
  presentPopover4(e: Event) {
    this.popover4.event = e;
    this.isOpen4 = true;
  }
  presentPopover5(e: Event) {
    this.popover5.event = e;
    this.isOpen5 = true;
  }

 

  mostrarCodCatastralNuevo = false;
  suministro?: number;
  codActualCatastro = new Catastro();
  codNuevoCatastro = new Catastro();
  datosCliente = new Cliente();
  direccionPredio = new PredioDireccion ();
  datosPredio =  new PredioDatos();
  datosSuministro = new DatosSuministro();
  conexionAgua =  new ConexionAgua();
  datosMedidor = new DatosMedidor();
  datosDesague = new DatosDesague();
  datosEntrevistado = new Entrevistado();
  datosEntrevistador = new Encuetador();
  datosValoresMaximos = new ValoresMaximos();
  datosZona = new Zonas();
  datosVias =  new Vias();
  ficha: any;

  provincias: Provincia[]=[];
  provinciasaux: Provincia[]=[];
  distritos: Distrito[]=[];
  zonas:Zonas[]=[];
  zonasFiltradas:Zonas[]=[];
  results:Zonas[] = [];
  vias:Vias[]=[];
  viasFiltradas:Vias[]=[];
  resultsVias:Vias[]=[];
  nombreUser:any="";
  idUs:any="";
  constructor(private  http : HttpClient

  ) { }
  ngOnInit() {
    this.getProvincias();
    this.nombreUser=localStorage.getItem('nombreUser');
    this.idUs=localStorage.getItem('idUsuario');
    this.datosEntrevistador.nombrePersona=this.nombreUser;
    this.datosEntrevistador.idPersona=this.idUs;
    //this.getZona(1,2);
  }
  async buscar(event: any) {
    
    const query = parseInt(event.target.value, 10);
    if (!isNaN(query)) {
      console.log(query);
      this.suministro=query;
      const ficha = await  this.cargarFicha(query);
      console.log(ficha);
    }else{
      this.mostrarCodCatastralNuevo=false;
    }
  }

  async cargarFicha(suministro: number): Promise<any> {
    return new Promise<boolean>((resolve, reject) => {
      this.http.get<any>('https://sisgeco.epsgrau.pe/SISGECO/servicioWeb/consultarFichaCastastral/' + suministro + '.htm')
        .subscribe(
          async (response) => {
            try {
              if (response.id == '1') {
                this.mostrarCodCatastralNuevo = true;
                const data = JSON.parse(response.data);
                this.codActualCatastro=data;
                this.datosCliente=data.toCliente;
                this.datosPredio= data.toPredio;
                this.datosSuministro= data.toSuministro;
                this.direccionPredio= data.toPredio.toPredioDireccion;
                this.conexionAgua =  data.toSuministro.toConexionAgua;
                this.datosMedidor  =data.toMedidor;
                this.datosDesague = data.toSuministro.toConexionDesague;
                console.log(response);
                console.log(data);
                console.log(this.direccionPredio);
                console.log(this.conexionAgua);
                console.log();
                
                //this.utils.mostrarToast(response.mensaje, 3000, 'success');
              } else {
                this.mostrarCodCatastralNuevo = true;
                resolve(false);
                throw new Error(response.operacion);

              }
            } catch (err) {
              console.error(err);
            }
          },
          (error) => {
            resolve(false); // Resuelve la promesa como falsa en caso de error
          }
        );
    });
  }

  selectProvincia(provincia: any) {
    this.codNuevoCatastro.idProvincia = provincia.idProvincia;
    this.getDistritos( this.codNuevoCatastro.idProvincia);
    this.isOpen = false; // Cierra el popover después de seleccionar una provincia
  }

  selectProvinciaDireccion(provincia: any) {
   this.direccionPredio.idProvincia = provincia.idProvincia;
   this.direccionPredio.descProvincia = provincia.descripcionProvincia;
   this.getDistritos( this.direccionPredio.idProvincia);
    // this.isOpen = false; // Cierra el popover después de seleccionar una provincia
    this.isOpen2 = false;
  }

  selectDistrito(distrito: any) {
    this.codNuevoCatastro.idDistrito = distrito.idDistrito;
    this.isOpen = false; // Cierra el popover después de seleccionar una provincia
  }

  selectDistritoDireccion(distrito: any) {
    console.log(distrito);
   this.direccionPredio.idDistrito = distrito.idDistrito;
   this.direccionPredio.descDistrito = distrito.descripcionDistrito;
   console.log(this.direccionPredio.idProvincia+'------' +this.direccionPredio.idDistrito );
   this.getZona( this.direccionPredio.idProvincia,this.direccionPredio.idDistrito);
   this.isOpen3 = false; // Cierra el popover después de seleccionar una provincia
  }

  selectZonaDireccion(zona:any) {
    console.log(zona);
   this.datosZona.num_zona = zona.num_zona;
   this.datosZona.descripcion_zona = zona.descripcion_zona;
   this.direccionPredio.numZona = zona.num_zona;
   this.direccionPredio.descZona = zona.descripcion_zona
   this.isOpen4 = false; // Cierra el popover después de seleccionar una provincia
   this.getVias(this.direccionPredio.idProvincia,this.direccionPredio.idDistrito);
  }
  selectViaDireccion(via:any) {

   this.datosVias.num_via = via.num_zona;
   this.datosVias.descripcion_via = via.descripcion_via;
   this.direccionPredio.numVia=via.num_zona;
   this.direccionPredio.descVia=via.descripcion_via
   console.log(via);

  }

  getProvincias() {
    this.http.get<Provincia[]>('https://sisgeco.epsgrau.pe/sisgeco-ws/problema/provincias').subscribe({
      next:response=>{
        this.provincias = response;
        this.provinciasaux = response;
      },
      error:error=>{
        console.error(error);
      }
    });

  }

  getDistritos(idProvincia: any) {
      this.http.get<Distrito[]>('https://sisgeco.epsgrau.pe/sisgeco-ws/problema/provincias/'+ idProvincia+'/distritos').subscribe({
        next:response=>{
          this.distritos = response;
          console.log(this.distritos);
        },
        error:error=>{
          console.error(error);
        }
      });
  
  }

  getZona(idProvincia: any, idDistrito: any) {
    this.http.get<any>('assets/data/tb_zona.json').subscribe({
      next: (response) => {
        // Filtrar la respuesta por idProvincia y idDistrito
       this.zonas = response.tb_zona;
       const filter =  this.zonas.filter(zonas => zonas.id_provincia==idProvincia && zonas.id_distrito==idDistrito );
      this.zonasFiltradas = filter;
      this.results = this.zonasFiltradas;
       console.log(filter);
      },
      error: (error) => {
        // Manejar el error si es necesario
      }
    });
  
  }

  getVias(idProvincia: any, idDistrito: any) {
    this.http.get<any>('assets/data/tb_via.json').subscribe({
      next: (response) => {
        // Filtrar la respuesta por idProvincia y idDistrito
      this.vias = response.tb_via;
      const filter =  this.vias.filter(vias => vias.id_provincia==idProvincia && vias.id_distrito==idDistrito );
      this.viasFiltradas = filter;
      this.resultsVias = this.viasFiltradas;
      console.log(filter);
      },
      error: (error) => {
        // Manejar el error si es necesario
      }
    });
  
  }


  handleInputZonas(event: any) {
    const query = event.target.value.toLowerCase();
    this.results = this.zonas.filter((d) => d.descripcion_zona?.toLowerCase().includes(query)||  d.num_zona?.toString().toLowerCase().includes(query));
  }

  handleInputVias(event: any) {
    const query = event.target.value.toLowerCase();
    this.resultsVias = this.vias.filter((d) => d.descripcion_via?.toLowerCase().includes(query));
  }

  grabar(){
    const objeto ={
      numInscripcion: this.suministro,
      conexionAgua:this.conexionAgua,
      datosValoresMaximos: this.datosValoresMaximos,
      datosMedidor: this.datosMedidor,

    } 
    console.log(objeto);
  }
  togleConexionAgua(){
    this.conexionAgua.flagCajaVisible = !this.conexionAgua.flagCajaVisible;
  }

  togleTieneMedidor(){
    this.datosMedidor.flagTieneMedidor= ! this.datosMedidor.flagTieneMedidor;
  }
  togleLecturaIlegible(){

    this.datosMedidor.flagLecturaIlegible = !this.datosMedidor.flagLecturaIlegible;

  }
  togleNumeroMedidorIlegible(){
    this.datosMedidor.flagNumeroMedidorIlegible=!this.datosMedidor.flagNumeroMedidorIlegible;
  }
  
}
