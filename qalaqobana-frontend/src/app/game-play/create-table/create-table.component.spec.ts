import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTableComponent } from './create-table.component';

describe('CreateTableComponent', () => {
  let component: CreateTableComponent;
  let fixture: ComponentFixture<CreateTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateTableComponent]
    });
    fixture = TestBed.createComponent(CreateTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
