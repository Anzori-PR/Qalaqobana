import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SocketService } from '../../core/services/socket.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html'
})
export class GameBoardComponent implements OnInit {
isCorrectAnswer(arg0: any,_t111: string): any {
throw new Error('Method not implemented.');
}
  roomCode!: string;
  form!: FormGroup;
  categories: string[] = [];
  currentLetter: string = '';
  timeLeft: number | null = null;
  timer: any;
  roundEnded = false;
  scores: any = {};
  allAnswers: any[] = [];
  players: any[] = [];
  creatorId!: string;
  leaderboard: { userId: string, username: string, score: number }[] = [];
  messages: any;
  isHovered: boolean = false; 
  copied: boolean = false;

  userId!: string;
  username!: string;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private socket: SocketService,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    this.roomCode = this.route.snapshot.paramMap.get('roomCode')!;
    this.userId = this.auth.getUserId() || '';
    this.username = this.auth.getUsername() || 'Guest';

    // Emit joinRoom event
    this.socket.emit('joinRoom', {
      roomCode: this.roomCode,
      userId: this.userId,
      username: this.username
    });

    
    this.setupSocketListeners();
  }

  setupSocketListeners() {
    this.socket.on('gameStarted', (data: { letter: string; categories: string[] }) => {
      const { letter, categories } = data;
      this.currentLetter = letter;
      this.categories = categories;
      this.form = this.fb.group(
        Object.fromEntries(categories.map((c) => [c, '']))
      );
      this.roundEnded = false;
      this.startTimer(60); // 60 second round

      this.form.valueChanges.subscribe((value) => {
        this.socket.emit('draftAnswers', {
          roomCode: this.roomCode,
          userId: this.auth.getUserId(),
          draft: value
        });
      });
    });

    this.socket.on('chatMessage', (msg: any) => {
      if (!this.messages) this.messages = [];
      this.messages.push(msg);
    });

    this.socket.on('roundResults', (data: { scores: any; allAnswers: any }) => {
      const { scores, allAnswers } = data;
      this.scores = Array.isArray(data.scores) ? data.scores : Object.values(data.scores);
      this.allAnswers = allAnswers || [];
      this.roundEnded = true;

      scores.forEach((score: any) => {
        const player = this.players.find(player => player.userId === score.userId);
        if (player) {
          // Add the round score to the existing score
          player.score = (player.score || 0) + score.score;
        }
      });
    });

    this.socket.on('playerList', (data: { players: any[], creatorId: string }) => {
      this.players = data.players;
      this.creatorId = data.creatorId;
    });

    this.socket.on('roomUpdate', (data: any) => {
      // Preserve scores when updating players
      this.players = (data.players || []).map((player: any) => {
        const existing = this.players.find(p => p.userId === player.userId);
        const leaderboardEntry = this.leaderboard.find(lb => lb.userId === player.userId);
        return {
          ...player,
          score: leaderboardEntry?.score ?? existing?.score ?? 0
        };
      });
  
      this.categories = data.categories || [];
      this.creatorId = data.creatorId;
    });
  
    this.socket.on('leaderboardUpdate', (data: any[]) => {
      this.leaderboard = data;
    
      // Update scores inside players
      this.players = this.players.map(player => {
        const updated = data.find(entry => entry.userId === player.userId);
        return {
          ...player,
          score: updated?.score ?? player.score ?? 0
        };
      });
    });    
  }

  onInputChange(category: string) {
    const control = this.form.get(category);
    const inputValue = control?.value || '';

    if (inputValue && !inputValue.toLowerCase().startsWith(this.currentLetter.toLowerCase())) {
      control?.setErrors({ startsWithLetter: true });
    } else {
      control?.setErrors(null);
    }
  }

  getPlayerAnswer(userId: string, category: string): string {
    const answerEntry = this.allAnswers.find(a => a.userId === userId);
    return answerEntry && answerEntry.answers ? answerEntry.answers[category] || 'N/A' : 'N/A';
  }
  
  
  getPlayerScore(userId: string): number {
    const scoreEntry = this.scoreEntries.find(s => s.userId === userId);
    return scoreEntry?.score || 0;
  }

  startGame() {

    if (this.players.length < 2) {
      return;
    }

    if (this.isCreator()) {
      this.socket.emit('startGame', {
        roomCode: this.roomCode,
        userId: this.auth.getUserId()
      });
    }
  }  

  stopRound() {
  // Check if any input starts with the correct letter
  const isValid = this.categories.every((category) => {
    const control = this.form.get(category);
    const inputValue = control?.value || '';
    return inputValue.toLowerCase().startsWith(this.currentLetter.toLowerCase()) && control?.valid;
  });

  if (!isValid) {
    return;
  }

    this.socket.emit('stopRound', { roomCode: this.roomCode });
  }

  startTimer(seconds: number) {
    this.timeLeft = seconds;
    this.timer = setInterval(() => {
      if (this.timeLeft! > 0) {
        this.timeLeft!--;
      } else {
        this.stopRound();
      }
    }, 1000);
  }

  // Function to copy the room code to the clipboard
  copyRoomCode() {
    navigator.clipboard.writeText(this.roomCode).then(() => {
      this.showCopiedMessage();
    }).catch((err) => {
      console.error('Failed to copy room code:', err);
    });
  }
  // Function to show the "Copied" message and hide it after 2 seconds
  showCopiedMessage() {
    this.copied = true;
    setTimeout(() => {
      this.copied = false;
    }, 2000);  // Hide after 2 seconds
  }

  // Function to manage hover effect state
  hoverEffect(isHovered: boolean) {
    this.isHovered = isHovered;
  }
  

  get scoreEntries() {
    return Array.isArray(this.scores) ? this.scores : [];
  }

  isCreator(): boolean {
    return this.auth.getUserId() === this.creatorId;
  }

  editScore(player: any) {
    player.isEditing = true;
    player.newScore = player.score || 0;
  }
  
  cancelEdit(player: any) {
    player.isEditing = false;
  }
  
  saveScore(player: any) {
    player.score = Number(player.newScore) || 0;
    player.isEditing = false;
  
    this.socket.emit('updateScore', {
      roomCode: this.roomCode,
      userId: player.userId,
      newScore: player.score
    });
  }
  
  
}
