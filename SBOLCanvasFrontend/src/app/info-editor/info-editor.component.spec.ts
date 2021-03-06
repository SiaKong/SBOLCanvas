import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoEditorComponent } from './info-editor.component';

describe('InfoEditorComponent', () => {
  let component: InfoEditorComponent;
  let fixture: ComponentFixture<InfoEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
