import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-country-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './country-details.component.html',
  styleUrls: ['./country-details.component.scss'],
})
export class CountryDetailsComponent implements OnInit, AfterViewChecked {
  country: any = null;
  loading = false;
  error = '';

  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  private mapInitialized = false;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('code');
    if (code) {
      this.fetchCountry(code);
    }
  }

  ngAfterViewChecked(): void {
    if (this.country && !this.mapInitialized && this.mapContainer?.nativeElement) {
      setTimeout(() => this.createMap(), 0);
    }
  }

  fetchCountry(code: string) {
    this.loading = true;
    this.http
      .get<any[]>(`https://restcountries.com/v3.1/alpha/${code}`)
      .subscribe({
        next: (data) => {
          this.country = data[0];
          this.loading = false;
          this.createMap(); // Try creating map after fetch
        },
        error: () => {
          this.error = 'Failed to load country data.';
          this.loading = false;
        },
      });
  }

  getLanguagesString(languages?: Record<string, string>): string {
    if (!languages) return 'N/A';
    return Object.values(languages).join(', ');
  }

  getCurrenciesString(
    currencies?: Record<string, { name: string; symbol: string }>
  ): string {
    if (!currencies) return 'N/A';
    return Object.values(currencies)
      .map((c) => `${c.name} (${c.symbol})`)
      .join(', ');
  }

  async createMap() {
  
    if (
      this.mapInitialized ||
      !this.mapContainer ||
      !this.mapContainer.nativeElement ||
      !this.country?.latlng
    ) {
      return;
    }
  
    this.mapInitialized = true;
  
    const L = await import('leaflet');
  
    const [lat, lng] = this.country.latlng;
  
    const map = L.map(this.mapContainer.nativeElement).setView([lat, lng], 5);
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
  
    L.marker([lat, lng]).addTo(map);
  }
  
}
