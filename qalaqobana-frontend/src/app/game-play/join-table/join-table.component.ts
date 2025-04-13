import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { SocketService } from 'src/app/core/services/socket.service';

@Component({
  selector: 'app-join-table',
  templateUrl: './join-table.component.html',
})
export class JoinTableComponent {
  roomCode = '';
  error = '';

  constructor(private socket: SocketService, private router: Router, private auth : AuthService) {}

  joinRoom() {
    const userId = this.auth.getUserId();
    
    this.socket.emit('joinRoom', { userId, roomCode: this.roomCode }, (res: any) => {
      if (res.success) {
        this.router.navigate(['/room', this.roomCode]);
      } else {
        this.error = res.message || 'ვერ მოხერხდა შეყვანა';
      }
    });
  }
}
