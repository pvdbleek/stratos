import { Component, Input, OnInit, Output } from '@angular/core';
import { Observable, of } from 'rxjs';
import { distinctUntilChanged, map, pairwise, startWith, withLatestFrom } from 'rxjs/operators';

import { EntitySchema } from '../../../../../store/src/helpers/entity-schema';
import { EntityMonitor } from '../../../../../store/src/monitors/entity-monitor';
import { EntityMonitorFactory } from '../../../../../store/src/monitors/entity-monitor.factory.service';
import { ActionState, RequestInfoState, rootUpdatingKey } from '../../../../../store/src/reducers/api-request-reducer/types';

export enum AppMonitorComponentTypes {
  UPDATE = 'MONITOR_UPDATE',
  DELETE = 'MONITOR_DELETE',
  CREATE = 'MONITOR_CREATE',
  FETCHING = 'MONITOR_FETCHING',
}

export interface IApplicationMonitorComponentState {
  busy: boolean;
  error: boolean;
  completed: boolean;
  message: string;
}

export class ActionMonitorComponentState {

  public currentState: Observable<IApplicationMonitorComponentState>;

  constructor(
    private entityMonitorFactory: EntityMonitorFactory,
    id: string,
    schema: EntitySchema,
    monitorState: AppMonitorComponentTypes,
    private updateKey: string
  ) {
    const entityMonitor = this.entityMonitorFactory.create(id, schema);
    this.currentState = this.getStateObservable(entityMonitor, monitorState);
  }

  private getStateObservable(entityMonitor: EntityMonitor, monitorState: AppMonitorComponentTypes) {
    switch (monitorState) {
      case AppMonitorComponentTypes.DELETE:
        return this.getDeletingState(entityMonitor);
      case AppMonitorComponentTypes.UPDATE:
        return this.getUpdatingState(entityMonitor);
      case AppMonitorComponentTypes.FETCHING:
        return this.getFetchingState(entityMonitor);
      default:
        throw new Error(`Unknown state to monitor ${monitorState}`);
    }
  }

  private getDeletingState(entityMonitor: EntityMonitor): Observable<IApplicationMonitorComponentState> {
    return entityMonitor.entityRequest$.pipe(
      map(requestState => ({
        busy: requestState.deleting.busy,
        error: requestState.deleting.error,
        completed: requestState.deleting.deleted,
        message: requestState.deleting.message
      }))
    );
  }

  private getFetchingState(entityMonitor: EntityMonitor): Observable<IApplicationMonitorComponentState> {
    const completed$ = this.getHasCompletedObservable(
      entityMonitor.entityRequest$.pipe(
        map(requestState => requestState.fetching),
      )
    );
    return entityMonitor.entityRequest$.pipe(
      withLatestFrom(completed$),
      map(([requestState, completed]) => {
        // const oldUpdatingState = requestState.fetching;
        // const updatingState = requestState.updating[this.updateKey];
        return {
          busy: requestState.fetching,
          error: requestState.error,
          completed,
          message: requestState.message
        };
      })
    );
  }

  private fetchUpdatingState = (requestState: RequestInfoState): ActionState =>
    (requestState.updating[this.updateKey] || { busy: false, error: false, message: '' })
  private getUpdatingState(entityMonitor: EntityMonitor): Observable<IApplicationMonitorComponentState> {


    const completed$ = this.getHasCompletedObservable(
      entityMonitor.entityRequest$.pipe(
        map(requestState => this.fetchUpdatingState(requestState).busy),
      )
    );
    return entityMonitor.entityRequest$.pipe(
      // pairwise(),
      withLatestFrom(completed$),
      map(([requestState, completed]) => {
        // const oldUpdatingState = this.fetchUpdatingState(requestState);
        const updatingState = this.fetchUpdatingState(requestState);
        return {
          busy: updatingState.busy,
          error: updatingState.error,
          completed,
          message: updatingState.message
        };
      })
    );
  }

  private getHasCompletedObservable(busy$: Observable<boolean>) {
    return this.currentState ? of(true) : busy$.pipe(
      distinctUntilChanged(),
      pairwise(),
      map(([oldBusy, newBusy]) => oldBusy && !newBusy),
      startWith(false)
    );
  }
}



@Component({
  selector: 'app-action-monitor-icon',
  templateUrl: './app-action-monitor-icon.component.html',
  styleUrls: ['./app-action-monitor-icon.component.scss']
})
export class AppActionMonitorIconComponent implements OnInit {

  @Input()
  public entityKey: string;

  @Input()
  public id: string;

  @Input()
  public schema: EntitySchema;

  @Input()
  public monitorState: AppMonitorComponentTypes = AppMonitorComponentTypes.FETCHING;

  @Input()
  public updateKey = rootUpdatingKey;

  @Output()
  public currentState: Observable<IApplicationMonitorComponentState>;

  constructor(private entityMonitorFactory: EntityMonitorFactory) { }

  ngOnInit() {
    const state: ActionMonitorComponentState = new ActionMonitorComponentState(
      this.entityMonitorFactory,
      this.id,
      this.schema,
      this.monitorState,
      this.updateKey
    );
    this.currentState = state.currentState;
    // const entityMonitor = this.entityMonitorFactory.create(this.id, this.schema);
    // this.currentState = this.getStateObservable(entityMonitor, this.monitorState);
  }

  // private getStateObservable(entityMonitor: EntityMonitor, monitorState: AppMonitorComponentTypes) {
  //   switch (monitorState) {
  //     case AppMonitorComponentTypes.DELETE:
  //       return this.getDeletingState(entityMonitor);
  //     case AppMonitorComponentTypes.UPDATE:
  //       return this.getUpdatingState(entityMonitor);
  //     case AppMonitorComponentTypes.FETCHING:
  //       return this.getFetchingState(entityMonitor);
  //     default:
  //       throw new Error(`Unknown state to monitor ${monitorState}`);
  //   }
  // }

  // private getDeletingState(entityMonitor: EntityMonitor): Observable<IApplicationMonitorComponentState> {
  //   return entityMonitor.entityRequest$.pipe(
  //     map(requestState => ({
  //       busy: requestState.deleting.busy,
  //       error: requestState.deleting.error,
  //       completed: requestState.deleting.deleted,
  //       message: requestState.deleting.message
  //     }))
  //   );
  // }

  // private getFetchingState(entityMonitor: EntityMonitor): Observable<IApplicationMonitorComponentState> {
  //   const completed$ = this.getHasCompletedObservable(
  //     entityMonitor.entityRequest$.pipe(
  //       map(requestState => requestState.fetching),
  //     )
  //   );
  //   return entityMonitor.entityRequest$.pipe(
  //     withLatestFrom(completed$),
  //     map(([requestState, completed]) => {
  //       // const oldUpdatingState = requestState.fetching;
  //       // const updatingState = requestState.updating[this.updateKey];
  //       return {
  //         busy: requestState.fetching,
  //         error: requestState.error,
  //         completed,
  //         message: requestState.message
  //       };
  //     })
  //   );
  // }

  // private fetchUpdatingState = (requestState: RequestInfoState): ActionState =>
  //   (requestState.updating[this.updateKey] || { busy: false, error: false, message: '' })
  // private getUpdatingState(entityMonitor: EntityMonitor): Observable<IApplicationMonitorComponentState> {


  //   const completed$ = this.getHasCompletedObservable(
  //     entityMonitor.entityRequest$.pipe(
  //       map(requestState => this.fetchUpdatingState(requestState).busy),
  //     )
  //   );
  //   return entityMonitor.entityRequest$.pipe(
  //     pairwise(),
  //     withLatestFrom(completed$),
  //     map(([[, requestState], completed]) => {
  //       // const oldUpdatingState = this.fetchUpdatingState(requestState);
  //       const updatingState = this.fetchUpdatingState(requestState);
  //       return {
  //         busy: updatingState.busy,
  //         error: updatingState.error,
  //         completed,
  //         message: updatingState.message
  //       };
  //     })
  //   );
  // }

  // private getHasCompletedObservable(busy$: Observable<boolean>) {
  //   return busy$.pipe(
  //     distinctUntilChanged(),
  //     pairwise(),
  //     map(([oldBusy, newBusy]) => oldBusy && !newBusy),
  //     startWith(false)
  //   );
  // }
}
