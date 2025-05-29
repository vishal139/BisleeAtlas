import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryExplorerComponent } from './country-explorer.component';

describe('CountryExplorerComponent', () => {
  let component: CountryExplorerComponent;
  let fixture: ComponentFixture<CountryExplorerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountryExplorerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CountryExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
