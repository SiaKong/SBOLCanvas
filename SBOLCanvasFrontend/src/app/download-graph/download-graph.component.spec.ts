import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadGraphComponent } from './download-graph.component';

describe('DownloadGraphComponent', () => {
  let component: DownloadGraphComponent;
  let fixture: ComponentFixture<DownloadGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DownloadGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
