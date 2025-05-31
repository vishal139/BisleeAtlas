import {
  Component,
  OnInit,
  AfterViewChecked,
  ViewChild,
  ElementRef,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common';

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

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('code');
    if (code) {
      this.fetchCountry(code);
    }
  }

  ngAfterViewChecked(): void {
    if (
      this.country &&
      !this.mapInitialized &&
      this.mapContainer?.nativeElement &&
      isPlatformBrowser(this.platformId) // Only run in browser
    ) {
      setTimeout(() => this.createMap(), 0);
    }
  }


  fetchCountry(code: string) {
    this.loading = true;
    this.http.get<any[]>(`https://restcountries.com/v3.1/alpha/${code}`).subscribe({
      next: async (data) => {
        this.country = data[0];
        this.loading = false;
  
        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => this.createMap(), 0);
        }
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
      !this.mapContainer?.nativeElement ||
      !this.country?.latlng ||
      !isPlatformBrowser(this.platformId)
    ) return;
  
    this.mapInitialized = true;
  
    const L = await import('leaflet');
    const [lat, lng] = this.country.latlng;
  
    const map = L.map(this.mapContainer.nativeElement).setView([lat, lng], 5);
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
  
    L.marker([lat, lng]).addTo(map);
  }
}
