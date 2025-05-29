import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
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
export class MapVisualizationComponent implements AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  marker: any;
  countries: Country[] = [];
  filteredCountries: Country[] = [];
  selectedCountryName = '';
  searchTerm = '';
  loading = true;
  error = '';
  mapInitialized = false;
  map: any;

  constructor(private http: HttpClient) {}

  ngAfterViewInit() {
    this.loadCountries();
  }

  loadCountries() {
    this.http.get<Country[]>('https://restcountries.com/v3.1/all').subscribe({
      next: (data) => {
        this.countries = data;
        this.filteredCountries = data
          .filter((c) => c.latlng && c.latlng.length === 2) // only countries with latlng
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
    const term = this.searchTerm.toLowerCase();
    this.filteredCountries = this.countries.filter(
      (c) =>
        c.name.common.toLowerCase().includes(term) &&
        c.latlng &&
        c.latlng.length === 2
    );
    if (this.filteredCountries.length > 0) {
      this.selectedCountryName = this.filteredCountries[0].name.common;
      this.onCountryChange();
    }
  }

  async onCountryChange() {
    this.mapInitialized = false;
    await this.createMap();
  }

  async createMap() {
    if (!this.selectedCountryName || !this.mapContainer) return;

    const country = this.countries.find(
      (c) => c.name.common === this.selectedCountryName
    );
    if (!country || !country.latlng || country.latlng.length !== 2) return;

    const L = await import('leaflet');

    if (!this.map) {
      // Create map only once
      const [lat, lng] = country.latlng;
      this.map = L.map(this.mapContainer.nativeElement).setView([lat, lng], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);

      this.marker = L.marker([lat, lng]).addTo(this.map);
    } else {
      // Move map smoothly to new location
      this.moveMapToCountry(country.latlng);
    }
  }

  moveMapToCountry(latlng: [number, number]) {
    if (!this.map || !this.marker) return;

    // Animate the map view to new location (duration in seconds)
    this.map.flyTo(latlng, 5, {
      duration: 1.5, // seconds
      easeLinearity: 0.25,
    });

    // Move the marker smoothly as well
    this.marker.setLatLng(latlng);
  }

  // Helper to call createMap only if mapContainer and countries are ready
  tryCreateMap() {
    if (
      this.mapContainer &&
      this.mapContainer.nativeElement &&
      this.selectedCountryName
    ) {
      this.createMap();
    } else {
      // If mapContainer not ready yet, wait a bit and retry (e.g. 100ms)
      setTimeout(() => this.tryCreateMap(), 100);
    }
  }
}
