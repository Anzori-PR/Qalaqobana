import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {
  [x: string]: any;
  private socket: Socket;

  constructor() {
    this.socket = io(environment.socketUrl, {
      withCredentials: true,
    });
  }

  emit(event: string, data: any, callback?: (res: any) => void) {
    this.socket.emit(event, data, callback);
  }

  listen<T>(event: string): Observable<T> {
    return new Observable<T>((subscriber) => {
      this.socket.on(event, (data: T) => {
        subscriber.next(data);
      });
    });
  }
  
  
  on(event: string, callback: (data: any) => void) {
    this.socket.on(event, callback);
  }

  off(event: string) {
    this.socket.off(event);
  }
}
