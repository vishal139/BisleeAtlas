import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-travel-wishlist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './travel-wishlist.component.html',
  styleUrls: ['./travel-wishlist.component.scss'],
})
export class TravelWishlistComponent {
  newCountry: string = '';
  wishlist: string[] = [];

  addCountry() {
    const trimmed = this.newCountry.trim();
    if (trimmed && !this.wishlist.includes(trimmed)) {
      this.wishlist.push(trimmed);
      this.newCountry = '';
    }
  }

  removeCountry(index: number) {
    this.wishlist.splice(index, 1);
  }
}
