import { inject, TestBed } from '@angular/core/testing';
import { createBasicStoreModule } from '@stratosui/store/testing';

import { PaginationMonitorFactory } from '../../../store/src/monitors/pagination-monitor.factory';
import { CoreTestingModule } from '../../test-framework/core-test.modules';
import { SessionService } from '../shared/services/session.service';
import { CoreModule } from './core.module';
import { EndpointsService } from './endpoints.service';
import { UtilsService } from './utils.service';

describe('EndpointsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EndpointsService,
        UtilsService,
        PaginationMonitorFactory,
        SessionService
      ],
      imports: [
        CoreModule,
        CoreTestingModule,
        createBasicStoreModule(),
      ]
    });
  });

  it('should be created', inject([EndpointsService], (service: EndpointsService) => {
    expect(service).toBeTruthy();
  }));
});
