import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SocketService } from 'src/app/core/services/socket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-table',
  templateUrl: './create-table.component.html',
})
export class CreateTableComponent {
  form: FormGroup;
  roomCode: string | null = null;
  error: string | null = null;
  categories = ['ქალაქი', 'სოფელი', 'სახელი', 'ცხოველი', 'მცენარე'];

  constructor(private fb: FormBuilder, private socket: SocketService, private router: Router) {
    const group: any = {};
    this.categories.forEach(cat => group[cat] = [false]);
    this.form = this.fb.group(group);
  }

  onSubmit() {
    const selected = Object.keys(this.form.value).filter(k => this.form.value[k]);
    
    // Validate at least 2 categories selected
    if (selected.length < 2) {
      this.error = "გთხოვთ აირჩიოთ მინიმუმ 2 კატეგორია";
      return;
    }

    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      this.error = "მომხმარებელი არ მოიძებნა. გთხოვთ თავიდან შეხვიდეთ სისტემაში.";
      return;
    }
  
    const user = JSON.parse(userStr);
    const userId = user?.user?.id;
  
    if (!userId) {
      this.error = "მომხმარებლის ID არ მოიძებნა. გთხოვთ თავიდან შეხვიდეთ სისტემაში.";
      return;
    }
  
    this.error = null; // Clear any previous errors
  
    this.socket.emit('createRoom', { userId, categories: selected }, (res: any) => {
      if (res.success) {
        this.roomCode = res.roomCode;
        this.router.navigate(['/room', res.roomCode]);
      } else {
        this.error = res.message || "ოთახის შექმნა ვერ მოხერხდა. გთხოვთ სცადოთ თავიდან.";
      }
    });
  }
}