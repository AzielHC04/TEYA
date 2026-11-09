import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTablasComponent } from './admin-tablas.component';

describe('AdminTablasComponent', () => {
  let component: AdminTablasComponent;
  let fixture: ComponentFixture<AdminTablasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTablasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminTablasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
