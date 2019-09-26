import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GetApplication } from '../../../../../cloud-foundry/src/actions/application.actions';
import { cfEntityFactory } from '../../../../../cloud-foundry/src/cf-entity-factory';
import { CustomImportModule } from '../../../../../core/src/custom-import.module';
import { TabNavService } from '../../../../../core/tab-nav.service';
import { generateTestApplicationServiceProvider } from '../../../../../core/test-framework/application-service-helper';
import { generateTestEntityServiceProvider } from '../../../../../core/test-framework/entity-service.helper';
import { generateCfBaseTestModules } from '../../../../test-framework/cloud-foundry-endpoint-service.helper';
import { applicationEntityType } from '../../../cf-entity-types';
import { ApplicationsModule } from '../applications.module';
import { ApplicationDeleteComponent } from './application-delete.component';

describe('ApplicationDeleteComponent', () => {
  let component: ApplicationDeleteComponent<any>;
  let fixture: ComponentFixture<ApplicationDeleteComponent<any>>;
  const appId = '1';
  const cfId = '2';
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ...generateCfBaseTestModules(),
        ApplicationsModule
      ],
      providers: [
        generateTestEntityServiceProvider(
          appId,
          cfEntityFactory(applicationEntityType),
          new GetApplication(appId, cfId)
        ),
        generateTestApplicationServiceProvider(cfId, appId),
        TabNavService
      ]
    }).overrideModule(ApplicationsModule, {
      remove: {
        imports: [CustomImportModule]
      }
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
