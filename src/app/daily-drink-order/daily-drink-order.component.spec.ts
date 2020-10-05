import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyDrinkOrderComponent } from './daily-drink-order.component';

describe('DailyDrinkOrderComponent', () => {
  let component: DailyDrinkOrderComponent;
  let fixture: ComponentFixture<DailyDrinkOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DailyDrinkOrderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DailyDrinkOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
