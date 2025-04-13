import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from 'src/app/core/services/socket.service';

@Component({
  selector: 'app-join-table',
  templateUrl: './join-table.component.html',
})
export class JoinTableComponent {
  roomCode = '';
  error = '';

  constructor(private socket: SocketService, private router: Router) {}

  joinRoom() {
    const userId = localStorage.getItem('userId');
    console.log('userId', userId);

    this.socket.emit('joinRoom', { userId, roomCode: this.roomCode }, (res: any) => {
      if (res.success) {
        this.router.navigate(['/room', this.roomCode]);
      } else {
        this.error = res.message || 'ვერ მოხერხდა შეყვანა';
      }
    });
  }
}
