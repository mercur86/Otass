import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
@Injectable({
  providedIn: 'root'
})
export class DatabaseSqliteService {

  private db: SQLiteObject;

  constructor(private sqlite: SQLite) {}

  // Función para crear/abrir la base de datos
  async createOpenDatabase(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        this.sqlite
          .create({
            name: 'otass.db',
            location: 'default',
          })
          .then((db: SQLiteObject) => {
            this.db = db;
            console.log('Base de datos creada / abierta');
            resolve(true); // Resuelve la promesa como verdadera
          })
          .catch((e) => {
            console.error('Error al crear/abrir la base de datos:', e);
            resolve(false); // Resuelve la promesa como falsa
          });
      } catch (error) {
        reject(error); // Rechaza la promesa en caso de excepción
      }
    });
  }

  // crear tabla usuarios 
  createTable(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const query = 'CREATE TABLE IF NOT EXISTS actividades (suministro INTEGER , longitud TEXT, latitud TEXT, dni TEXT, nombreUser TEXT, idActividad TEXT , lectura TEXT , observacion TEXT   )';
      this.db
        .executeSql(query, [])
        .then((result) => {
          console.log('Tabla creada o ya existe'+ JSON.stringify(result));
          resolve(true); // Resuelve la promesa como verdadera
        })
        .catch((e) => {
          alert('Error al crear la tabla: ' + JSON.stringify(e));
          resolve(false); // Resuelve la promesa como falsa
        });
    });
  }

}
