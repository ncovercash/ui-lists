export interface ListRefresh {
  id: string;
  listId: string;
  status: string;
  refreshStartDate: string;
  refreshEndDate: string;
  refreshedBy: string;
  refreshedByUsername: string;
  recordsCount: number;
  contentVersion?: number;
}

export enum POLLING_STATUS {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export type InProgressRefresh = {
  id: string;
  listId: string,
  status: POLLING_STATUS,
  refreshStartDate: string,
  refreshedBy: string,
  refreshedByUsername: string
};

export type SuccessRefresh = {
  id: string;
  listId: string,
  status: POLLING_STATUS.SUCCESS,
  refreshStartDate: string,
  refreshEndDate: string,
  refreshedBy: string,
  refreshedByUsername: string
  recordsCount: number,
  contentVersion: number
};

export interface ListExport {
  createdBy: string;
  endDate?: string;
  exportId: string
  listId: string
  startDate: string
  status: POLLING_STATUS
}

export interface FailedListRefresh extends ListRefresh {
  error: {
    code: string,
    message: string
  }
}

export interface ListsRecordBase {
  id: string;
  name: string;
  version: number;
  description?: string;
  entityTypeId?: string;
  entityTypeName?: string;
  userFriendlyQuery?: string;
  fqlQuery?: string;
  createdByUsername?: string;
  createdDate?: string;
  isActive?: boolean;
  isPrivate?: boolean;
  isCanned?: boolean;
  updatedBy?: boolean;
  updatedByUsername?: boolean;
  updatedDate?: string;
  recordsCount?: number;
}

export interface ListsRecordDetails extends ListsRecordBase {
  successRefresh?: SuccessRefresh;
  inProgressRefresh?: InProgressRefresh;
  failedRefresh?: FailedListRefresh;
}

export interface ListsRecord extends ListsRecordBase {
  refreshedDate: string;
  refreshedByUsername: string;
  isRefreshing: boolean;
}

