import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  Inject,
  PLATFORM_ID,
  OnDestroy,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface Country {
  name: { common: string };
  latlng: [number, number];
}

@Component({
  selector: 'app-map-visualization',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './map-visualization.component.html',
  styleUrls: ['./map-visualization.component.scss'],
})
export class MapVisualizationComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  marker: any;
  countries: Country[] = [];
  filteredCountries: Country[] = [];
  selectedCountryName = '';
  searchTerm = '';
  loading = true;
  error = '';
  map: any;
  public isBrowser = isPlatformBrowser(this.platformId);

  private mapInitialized = false;
  private leaflet: any;

  private filterDebounceTimer: any;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit() {
    if (this.isBrowser) {
      this.loadCountries();
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    if (this.filterDebounceTimer) {
      clearTimeout(this.filterDebounceTimer);
    }
  }

  loadCountries() {
    this.http.get<Country[]>('https://restcountries.com/v3.1/all').subscribe({
      next: (data) => {
        this.countries = data;
        this.filteredCountries = data
          .filter((c) => c.latlng && c.latlng.length === 2)
          .sort((a, b) => a.name.common.localeCompare(b.name.common));

        if (this.filteredCountries.length > 0) {
          this.selectedCountryName = this.filteredCountries[0].name.common;
          this.tryCreateMap();
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load countries';
        this.loading = false;
      },
    });
  }

  filterCountries() {
    // Debounce filter input by 300ms to reduce calls
    if (this.filterDebounceTimer) {
      clearTimeout(this.filterDebounceTimer);
    }
    this.filterDebounceTimer = setTimeout(() => {
      const term = this.searchTerm.toLowerCase();
      const filtered = this.countries.filter(
        (c) => c.name.common.toLowerCase().includes(term) && c.latlng && c.latlng.length === 2
      );

      this.filteredCountries = filtered;

      if (filtered.length > 0) {
        // Only trigger onCountryChange if selection changed
        if (this.selectedCountryName !== filtered[0].name.common) {
          this.selectedCountryName = filtered[0].name.common;
          this.onCountryChange();
        }
      }
    }, 300);
  }

  async onCountryChange() {
    await this.createMap();
  }

  async createMap() {
    if (
      !this.selectedCountryName ||
      !this.mapContainer ||
      !this.mapContainer.nativeElement ||
      !this.isBrowser
    )
      return;

    const country = this.countries.find((c) => c.name.common === this.selectedCountryName);
    if (!country || !country.latlng || country.latlng.length !== 2) return;

    if (!this.leaflet) {
      this.leaflet = await import('leaflet');
    }
    const L = this.leaflet;

    const [lat, lng] = country.latlng;

    if (!this.map) {
      this.map = L.map(this.mapContainer.nativeElement).setView([lat, lng], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);

      this.marker = L.marker([lat, lng]).addTo(this.map);
      this.mapInitialized = true;
    } else {
      this.moveMapToCountry(country.latlng);
    }
  }

  moveMapToCountry(latlng: [number, number]) {
    if (!this.map || !this.marker) return;

    this.map.flyTo(latlng, 5, {
      duration: 1.5,
      easeLinearity: 0.25,
    });

    this.marker.setLatLng(latlng);
  }

  tryCreateMap() {
    if (this.mapContainer && this.mapContainer.nativeElement && this.selectedCountryName) {
      this.createMap();
    } else if (this.isBrowser) {
      setTimeout(() => this.tryCreateMap(), 100);
    }
  }
}
