import { Injectable } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
@Injectable({
    providedIn: 'root'
})
export class UtilServices {
    private loading: any;
    constructor(
        private alertController: AlertController,
        private toast: ToastController,
        private loadingController: LoadingController
    ) { }

    /** 
     * muestra una alerta ".
     * @param {string} header - cabecera del alerta
     * @param {string} mensaje - indicar mensaje a mostrar 
     */
    async presentAlertPersonalizado(header:string,mensaje: string) {
        const alert = await this.alertController.create({
            header: header,
            message: mensaje,
            cssClass: 'my-custom-class'
        });
        await alert.present();
    }

        /** 
     * muestra una alerta ".
     * @param {string} header - cabecera del alerta
     * @param {string} mensaje - indicar mendaje a mostrar 
     */
        async presentAlertPersonalizadoDanger(header:string,mensaje: string) {
            const alert = await this.alertController.create({
                header: header,
                message: mensaje,
                cssClass: 'alert-danger-class'
            });
            await alert.present();
        }

    async loader() {
        this.loading = await this.loadingController.create({
            message: 'Espere un momento',
            spinner: 'crescent'
        });
        await this.loading.present();
    }

    /** 
     * muestra un loader temporal".
     * @param {string} mensaje - indicar mendaje a mostrar 
     * @param {string} spinner - indicar tipo de spinner
     */
    async loaderPersonalizado(mensaje: string, spinner: "bubbles" | "circles" | "circular" | "crescent" | "dots" | "lines" | "lines-small" | "lines-sharp" | "lines-sharp-small" | null | undefined) {
        this.loading = await this.loadingController.create({
            message: mensaje,
            spinner: spinner
        });
        await this.loading.present();
    }
    closeLoader() {
        this.loading.dismiss();
    }

    /** 
     * muestra un toast ".
     * @param {string} mensaje - indicar mendaje a mostrar en toast
     * @param {number} tiempo - indicar tiempo en mili segundos
     * @param {string} color - Color danger, succes, warning.
     */
    async mostrarToast(mensaje: string, tiempo: number, color: string) {
        const toast = await this.toast.create({
            message: mensaje,
            duration: tiempo,
            position:"middle",
            color: color
        });
        toast.present();

    }
    /** 
     * verifica si un objeto se encuentra vacio por completo ".
     * retorna verdadero de estar vacio ".
     * @param {any} objectName - indicar mendaje a mostrar 
     */
    isObjectEmpty = (objectName:any) => {
        console.log(JSON.stringify(objectName));
        return JSON.stringify(objectName) === "{}"; // devuelve verdad si esta vacio
      };
      
      /**
     * Formatea una fecha de tipo Date ()".
     * @param {Date} fechaOriginal - La fecha a formatear.
     * @param {string} formato - indicar el formato de la salida dd/mm/aaa , aaaa-mm-dd , etc..
     * @returns {string} La fecha formateada en el formatoindicado
     */
    formatearFecha(fechaOriginal: Date, formato: string): string {
        const dia = fechaOriginal.getDate();
        const mes = fechaOriginal.getMonth() + 1;
        const año = fechaOriginal.getFullYear();
        // Reemplaza "dd", "mm" y "aaaa" en el formato con los valores reales
        formato = formato.replace("dd", dia < 10 ? `0${dia}` : dia.toString());
        formato = formato.replace("mm", mes < 10 ? `0${mes}` : mes.toString());
        formato = formato.replace("aaaa", año.toString());
        return formato;
      }

    /**
     * agrega dias a  una fecha de tipo Date ()".
     * @param {Date} date - La fecha iniciaal
     * @param {number} days - indicar dias a sumar 
     * @returns {Date} La fecha con dias sumados
     */
      addDaysToDate(date:Date, days:number):Date{
        var res = new Date(date);
        res.setDate(res.getDate() + days);
        return res;
    }

       /**
     * cadena a fecha con formatp /".
     * @param {String}  fechaStr fecha iniciaal
     * @returns {Date} La fecha 
     */
 
  
}