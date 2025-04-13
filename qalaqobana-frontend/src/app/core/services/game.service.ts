import { Injectable, signal } from '@angular/core';
import { SocketService } from './socket.service';

@Injectable({ providedIn: 'root' })
export class GameService {
  currentLetter = signal<string|null>(null);
  categories = signal<string[]>([]);
  players = signal<any[]>([]);
  scores = signal<Record<string, number>>({});

  constructor(private socket: SocketService) {
    this.socket.listen('roundStarted').subscribe((data: any) => {
      this.currentLetter.set(data.letter);
    });
    
    this.socket.listen('roundResults').subscribe((data: any) => {
      this.scores.set(data.scores);
    });
  }

  startGame(categories: string[]) {
    this.categories.set(categories);
    this.socket.emit('startGame', { categories });
  }

  submitAnswers(answers: Record<string, string>) {  
    this.socket.emit('submitAnswers', { answers });
  }
}