import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SocketService } from './socket.service';

export interface ChatMessage {
  id: string;
  roomCode: string;
  senderId: string;
  senderUsername: string;
  message: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(private socketService: SocketService) {}

  sendMessage(roomCode: string, { userId, username, message }: { userId: string, username: string, message: string }): void {
    this.socketService.emit('chatMessage', { roomCode, userId, message });
  }
  
  getMessages(): Observable<any> {
    return this.socketService.listen('chatMessage'); // This is the one your backend emits
  }
  
} 