import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  titles = 'ქალაქობანა';

  constructor(private title: Title, private meta: Meta) {
    this.title.setTitle('Qalaqobana — Multiplayer Word Game in Georgian');
    this.meta.updateTag({ name: 'description', content: 'Play Qalaqobana online with friends — a fun Georgian word game.' });
  }
}
