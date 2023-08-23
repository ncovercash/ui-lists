import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
  AccordionSet,
  ConfirmationModal,
  Layer,
  Loading,
  LoadingPane,
  Pane,
  Paneset,
} from '@folio/stripes/components';
import { HTTPError } from 'ky';
import { useIntl } from 'react-intl';
import { useQueryClient } from 'react-query';
import { t, isInactive, isInDraft, isCanned, computeErrorMessage } from '../../services';
import { useListDetails, useRefresh, useDeleteList, useCSVExport, useMessages } from '../../hooks';
import {
  ListAppIcon, ListInformationMenu,
  MetaSectionAccordion,
  SuccessRefreshSection,
  ListInformationResultViewer
} from './components';
import { HOME_PAGE_URL } from '../../constants';
import { EntityTypeColumn } from '../../interfaces';
import { getVisibleColumnsKey } from '../../utils';

import './ListInformationPage.module.css';

export const ListInformationPage: React.FC = () => {
  const history = useHistory();
  const { formatNumber } = useIntl();
  const { id }: {id: string} = useParams();

  const { data: listData, isLoading: isDetailsLoading } = useListDetails(id);
  const { name: listName = '' } = listData || {};

  const { requestExport, isExportInProgress, isCancelExportInProgress, cancelExport } = useCSVExport({
    listId: id,
    listName
  });
  const queryClient = useQueryClient();
  const [showSuccessRefreshMessage, setShowSuccessRefreshMessage] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const { showSuccessMessage, showErrorMessage } = useMessages();
  const { initRefresh, isRefreshInProgress, cancelRefresh, isCancelRefreshInProgress, polledData } = useRefresh({
    listId: id,
    inProgressRefresh: listData?.inProgressRefresh,
    onErrorPolling: (code) => {
      showErrorMessage({
        message: t(code || 'callout.list.refresh.error', {
          listName
        })
      });
    },
    onSuccessPolling: () => {
      setShowSuccessRefreshMessage(true);
    },
    onError: async (error: HTTPError) => {
      const errorMessage = await computeErrorMessage(error, 'callout.list.refresh.error', {
        listName
      });

      showErrorMessage({ message: errorMessage });
    },
    onCancelError: async (error: HTTPError) => {
      const errorMessage = await computeErrorMessage(error, 'cancel-refresh.default', {
        listName
      });

      showErrorMessage({ message: errorMessage });
    },
    onCancelSuccess: () => {
      showSuccessMessage({
        message: t('cancel-refresh.success', {
          listName
        })
      });
    }
  });

  const { isDeleteInProgress, deleteList } = useDeleteList({ id,
    onSuccess: () => {
      showSuccessMessage({
        message: t('callout.list.delete.success', {
          listName
        })
      });
      history.push(HOME_PAGE_URL);
    },
    onError: async (error: HTTPError) => {
      const errorMessage = await computeErrorMessage(error, 'callout.list.delete.error', {
        listName
      });

      showErrorMessage({ message: errorMessage });
    } });

  const updateListDetailsData = () => {
    queryClient.setQueryData(['listDetails', id], polledData);
  };

  const deleteListHandler = async () => {
    setShowConfirmDeleteModal(false);
    await deleteList();
  };
  const closeSuccessMessage = () => {
    setShowSuccessRefreshMessage(false);
  };

  const [columnFilterList, setColumnControlList] = useState<EntityTypeColumn[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

  const handleColumnsChange = ({ values }: {values: string[]}) => {
    // There is always should be at least one selected column
    if (values.length === 0) {
      return;
    }
    localStorage.setItem(getVisibleColumnsKey(listData?.id), JSON.stringify(values));

    setVisibleColumns(values);
  };

  const refresh = async () => {
    if (!listData?.inProgressRefresh) {
      initRefresh();
      closeSuccessMessage();
      if (polledData) {
        updateListDetailsData();
      }
    }
  };

  const onVewListClickHandler = () => {
    if (polledData) {
      updateListDetailsData();
    }

    setShowSuccessRefreshMessage(false);
  };


  if (isDetailsLoading) {
    return <LoadingPane />;
  }

  const recordCount = listData?.successRefresh?.recordsCount || 0;

  const buttonHandlers = {
    'cancel-refresh': () => {
      cancelRefresh();
    },
    'refresh': () => {
      refresh();
    },
    'edit':  () => {
      history.push(`${id}/edit`);
    },
    'delete': () => {
      setShowConfirmDeleteModal(true);
    },
    'export': () => {
      requestExport();
    },
    'cancel-export': () => {
      cancelExport();
    },
  };

  const conditions = {
    isRefreshInProgress,
    isCancelRefreshInProgress,
    isExportInProgress,
    isCancelExportInProgress,
    isDeleteInProgress,
    isListInactive: isInactive(listData),
    isListInDraft: isInDraft(listData),
    isListCanned: isCanned(listData)
  };

  return (
    <Paneset data-testid="listInformation">
      <Layer isOpen contentLabel="">
        <Paneset isRoot>
          <Pane
            dismissible
            defaultWidth="fill"
            appIcon={<ListAppIcon />}
            paneTitle={listData?.name}
            paneSub={!isRefreshInProgress ?
              t('mainPane.subTitle',
                { count: formatNumber(recordCount) })
              :
              <>{t('lists.item.compiling')}<Loading /></>}
            lastMenu={<ListInformationMenu
              visibleColumns={visibleColumns}
              columns={columnFilterList}
              onColumnsChange={handleColumnsChange}
              buttonHandlers={buttonHandlers}
              conditions={conditions}
            />}
            onClose={() => history.push(HOME_PAGE_URL)}
            subheader={<SuccessRefreshSection
              shouldShow={showSuccessRefreshMessage}
              recordsCount={formatNumber(polledData?.successRefresh?.recordsCount || 0)}
              onViewListClick={onVewListClickHandler}
            />}
          >
            <AccordionSet>
              <MetaSectionAccordion listInfo={listData} />
            </AccordionSet>

            <AccordionSet>
              <ListInformationResultViewer
                listID={listData?.id}
                userFriendlyQuery={listData?.userFriendlyQuery}
                entityTypeId={listData?.entityTypeId}
                setColumnControlList={setColumnControlList}
                setVisibleColumns={setVisibleColumns}
                visibleColumns={visibleColumns}
              />
            </AccordionSet>
          </Pane>
        </Paneset>
      </Layer>
      <ConfirmationModal
        buttonStyle="danger"
        confirmLabel={t('list.modal.delete')}
        heading={t('list.modal.delete-list')}
        message={t('list.modal.confirm-message', { listName })}
        onCancel={() => setShowConfirmDeleteModal(false)}
        onConfirm={() => {
          deleteListHandler();
        }}
        open={showConfirmDeleteModal}
      />
    </Paneset>
  );
};