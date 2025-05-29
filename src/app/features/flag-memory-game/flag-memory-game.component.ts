import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import confetti from 'canvas-confetti';
import { FormsModule } from '@angular/forms';

interface Card {
  id: number;
  country: string;
  flag: string;
  flipped: boolean;
  matched: boolean;
}

@Component({
  selector: 'app-flag-memory-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './flag-memory-game.component.html',
  styleUrls: ['./flag-memory-game.component.scss'],
})
export class FlagMemoryGameComponent implements OnInit {
  cards: Card[] = [];
  flippedCards: Card[] = [];
  moves = 0;
  isBusy = false;
  pairOptions = [2, 3, 4, 5, 6];
  pairCount = 3; // default


  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadCards();
  }

  // loadCards() {
  //   this.http
  //     .get<any[]>('https://restcountries.com/v3.1/all')
  //     .subscribe((data) => {
  //       const selected = data.slice(0, 4); // 6 countries for 12 cards
  //       let idCounter = 0;

  //       const cardPairs: Card[] = selected.flatMap((country) => {
  //         const cardData = {
  //           country: country.name.common,
  //           flag: country.flags?.png || country.flags?.svg,
  //           flipped: false,
  //           matched: false,
  //         };
  //         return [
  //           { ...cardData, id: idCounter++ },
  //           { ...cardData, id: idCounter++ },
  //         ];
  //       });

  //       this.cards = this.shuffleArray(cardPairs);
  //       this.moves = 0;
  //       this.flippedCards = [];
  //       this.isBusy = false;
  //     });
  // }


loadCards() {
  this.http.get<any[]>('https://restcountries.com/v3.1/all').subscribe((data) => {
    const shuffled = this.shuffleArray(data);
    const selected = shuffled.slice(0, this.pairCount); // Use dynamic pair count
    let idCounter = 0;

    const cardPairs: Card[] = selected.flatMap((country:any) => {
      const cardData = {
        country: country.name.common,
        flag: country.flags?.png || country.flags?.svg || '',
        flipped: false,
        matched: false,
      };
      return [
        { ...cardData, id: idCounter++ },
        { ...cardData, id: idCounter++ },
      ];
    });
    this.cards=[]
    this.cards = this.shuffleArray(cardPairs);
    this.moves = 0;
    this.flippedCards = [];
    this.isBusy = false;
  });
}


  shuffleArray(array: Card[]): Card[] {
    return array
      .map((a) => ({ sort: Math.random(), value: a }))
      .sort((a, b) => a.sort - b.sort)
      .map((a) => a.value);
  }

  flipCard(card: Card) {
    if (
      this.isBusy ||
      card.flipped ||
      card.matched ||
      this.flippedCards.includes(card)
    )
      return;

    if (this.flippedCards.length >= 2) return; // prevent flipping more than 2 cards

    card.flipped = true;
    this.flippedCards.push(card);

    if (this.flippedCards.length === 2) {
      this.moves++;
      this.isBusy = true;

      const [first, second] = this.flippedCards;

      setTimeout(() => {
        if (first.country === second.country) {
          first.matched = true;
          second.matched = true;
          // 🎉 Trigger confetti on a successful match
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
          });

          // Check for win condition
          if (this.cards.every((c) => c.matched)) {
            this.showVictoryCelebration();
          }
        } else {
          first.flipped = false;
          second.flipped = false;
        }

        this.flippedCards = [];
        this.isBusy = false;
      }, 800);
    }
  }

  resetGame() {
    this.loadCards();
  }

  get allMatched(): boolean {
    return this.cards.length > 0 && this.cards.every((card) => card.matched);
  }

  showVictoryCelebration() {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 1000,
    };

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
      });
    }, 250);
  }
}
