import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CoreComponent } from '@app/base';
import { AlertType } from '@app/base/models';

import { NotificationContextType, NotificationService } from '@modules/shared/services/notification.service';
import { INNOVATION_SECTION_ACTION_STATUS } from '@modules/stores/innovation/innovation.models';

import { AccessorService, getInnovationActionInfoOutDTO } from '../../../services/accessor.service';


@Component({
  selector: 'app-accessor-pages-innovation-action-tracker-info',
  templateUrl: './action-tracker-info.component.html'
})
export class InnovationActionTrackerInfoComponent extends CoreComponent implements OnInit {

  innovationId: string;
  actionId: string;

  alert: AlertType = { type: null };

  actionName: string;
  actionStatus: keyof typeof INNOVATION_SECTION_ACTION_STATUS;
  isQualifyingAccessorRole = false;

  action?: getInnovationActionInfoOutDTO;

  innovationSectionActionStatus = this.stores.innovation.INNOVATION_SECTION_ACTION_STATUS;


  constructor(
    private activatedRoute: ActivatedRoute,
    private accessorService: AccessorService,
    private notificationService: NotificationService,
  ) {

    super();
    this.setPageTitle('Action details');

    this.innovationId = this.activatedRoute.snapshot.params.innovationId;
    this.actionId = this.activatedRoute.snapshot.params.actionId;
    this.actionName = '';
    this.actionStatus = '';
    this.isQualifyingAccessorRole = this.stores.authentication.isQualifyingAccessorRole();

    switch (this.activatedRoute.snapshot.queryParams.alert) {
      case 'actionCreationSuccess':
        this.alert = {
          type: 'SUCCESS',
          title: 'Action requested',
          message: 'The innovator has been notified of your action request.'
        };
        break;
      case 'actionUpdateSuccess':
        this.alert = {
          type: 'SUCCESS',
          title: `You have updated the status of this action to '${this.activatedRoute.snapshot.queryParams.status}'`,
          message: 'The innovator will be notified of this status change'
        };
        break;
      default:
        break;
    }

  }


  ngOnInit(): void {

    this.accessorService.getInnovationActionInfo(this.innovationId, this.actionId).subscribe(
      response => {
        this.action = response;
      },
      error => {
        this.logger.error(error);
      }
    );

    this.notificationService.dismissNotification(this.actionId, NotificationContextType.ACTION).subscribe();
  }

}
