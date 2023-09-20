import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Platform } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private platform: Platform;
  public photos: UserPhoto[] = [];
  private PHOTO_STORAGE: string = 'photos';
  constructor(platform: Platform) {
    this.platform = platform;
  }

  public async addNewToGallery(): Promise<boolean> {
    // Tomar una foto
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 50
    });
  
    this.photos.unshift({
      filepath: "soon...",
      webviewPath: capturedPhoto.webPath
    });
  
    // Guardar la foto en el sistema de archivos y agregarla a la colección de fotos
    const savedImageFile = await this.savePicture(capturedPhoto);
   // this.photos.unshift(savedImageFile);
  
    // Guardar la foto en el localStorage
    const photosFromLocalStorage = localStorage.getItem(this.PHOTO_STORAGE);
    let photos = photosFromLocalStorage ? JSON.parse(photosFromLocalStorage) : [];
    photos.unshift(savedImageFile.filepath);
    localStorage.setItem(this.PHOTO_STORAGE, JSON.stringify(photos));
  
    Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos),
    });
    if(savedImageFile){
      return true;
    }else{
      return false;
    }
    
  }

  // Save picture to file on device
  private async savePicture(photo: Photo): Promise<UserPhoto> {
    // Convert photo to base64 format
    const base64Data = await this.readAsBase64(photo);
  
    // Create a new file name
    const fileName = new Date().getTime() + '.jpeg';
  
    // Write the base64 data to the data directory
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });
  
    // Use webPath to display the new image
    return {
      filepath: fileName,
      webviewPath: photo.webPath
    };
  }
  
 
  
  
  private async readAsBase64(photo: Photo): Promise<string> {
    // "hybrid" will detect Cordova or Capacitor
    if (this.platform.is('hybrid')) {
      // Read the file into base64 format
      const file = await Filesystem.readFile({
        path: photo.path!
      });
  
      return file.data;
    } else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(photo.webPath!);
      const blob = await response.blob();
  
      return await this.convertBlobToBase64(blob) as string;
    }
  }
  
  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  public async loadSaved() {
    // Retrieve cached photo array data
    const { value } = await Preferences.get({ key: this.PHOTO_STORAGE });
    this.photos = (value ? JSON.parse(value) : []) as UserPhoto[];
    // Easiest way to detect when running on the web:
// “when the platform is NOT hybrid, do this”
if (!this.platform.is('hybrid')) {
  // Display the photo by reading into base64 format
  for (let photo of this.photos) {
    // Read each saved photo's data from the Filesystem
    const readFile = await Filesystem.readFile({
        path: photo.filepath,
        directory: Directory.Data
    });

    // Web platform only: Load the photo as base64 data
    photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
  }
}
}

public convertPhotosToFiles(): File[] {
    const files: File[] = [];
    // Recorre la lista de UserPhoto
    for (const photo of this.photos) {
      // Obtén el archivo real a partir de la ruta de la foto
      const file = this.photoToFile(photo);
      if (file) {
        // Agrega el archivo a la lista
        files.push(file);
      }
}

return files;
}

private photoToFile(photo: UserPhoto): File | null {
  if (photo.webviewPath) {
    const filename = this.getFilenameFromPath(photo.webviewPath);
    const blob = this.dataURItoBlob(photo.webviewPath);
    if (blob) {
    return new File([blob], filename);
    }
  }
  return null;
}

private getFilenameFromPath(path: string): string {
const startIndex = path.lastIndexOf('/') + 1;
return path.substring(startIndex);
}

private dataURItoBlob(dataURI: string): Blob | null {
  const uriComponents = dataURI.split(',');

  if (uriComponents.length !== 2) {
    return null;
  }

  const mimeType = uriComponents[0].split(':')[1].split(';')[0];
  const encodedData = uriComponents[1];
  const decodedData = decodeURIComponent(encodedData);

  const byteCharacters = atob(decodedData);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: mimeType });
}

}

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}
