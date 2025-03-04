import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GoalDetailsPage } from './goal-details.page';

describe('GoalDetailsPage', () => {
  let component: GoalDetailsPage;
  let fixture: ComponentFixture<GoalDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
