import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddProjectDialog } from './add-project-dialog';

describe('AddProjectDialog', () => {
  let component: AddProjectDialog;
  let fixture: ComponentFixture<AddProjectDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddProjectDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddProjectDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
