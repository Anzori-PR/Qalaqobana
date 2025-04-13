import { Component, ElementRef, Input, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ChatService } from '../../core/services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html'
})
export class ChatComponent implements OnInit, AfterViewInit {
  @Input() roomCode!: string;
  @Input() userId!: string;
  @Input() username!: string;

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  chatForm!: FormGroup;
  messages: any[] = [];

  constructor(
    private fb: FormBuilder,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.chatForm = this.fb.group({
      message: ['']
    });

    this.chatService.getMessages().subscribe((msg) => {
      this.messages.push(msg);
      setTimeout(() => this.scrollToBottom(), 0); // Wait for DOM to update
    });
    
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  sendMessage(): void {
    const message = this.chatForm.get('message')?.value?.trim();
    if (!message) return;

    this.chatService.sendMessage(this.roomCode, {
      userId: this.userId,
      username: this.username,
      message
    });

    this.chatForm.reset();
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    }
  }
}
