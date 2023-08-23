import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import {
  Icon,
  Pane,
  PaneMenu,
  Paneset,
  Button,
  // @ts-ignore:next-line
  FilterGroups,
  LoadingPane
} from '@folio/stripes/components';
// @ts-ignore:next-line
import { CollapseFilterPaneButton, ExpandFilterPaneButton } from '@folio/stripes/smart-components';

import { ListsTable, ListAppIcon } from '../../components';
import { useLocalStorageToggle } from '../../hooks';
import { noop } from '../../utils';
import { t } from '../../services';
import { CREATE_LIST_URL } from '../../constants';
import { FILTER_PANE_VISIBILITY_KEY } from '../../utils/constants';
import { useFilterConfig, useFilters } from './hooks';

import css from './ListPage.module.css';


export const ListPage: React.FC = () => {
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterPaneIsVisible, toggleFilterPane] = useLocalStorageToggle(FILTER_PANE_VISIBILITY_KEY, true);
  const { filterConfig, isLoadingConfigData } = useFilterConfig();
  const {
    onChangeFilter,
    resetAll,
    filterCount,
    activeFilters,
    appliedFilters
  } = useFilters(filterConfig);

  if (isLoadingConfigData) return <LoadingPane />;

  return (
    <Paneset data-test-root-pane>
      {filterPaneIsVisible &&
        <Pane
          defaultWidth="20%"
          paneTitle={t('filterPane.title')}
          lastMenu={
            <PaneMenu>
              <CollapseFilterPaneButton onClick={toggleFilterPane} />
            </PaneMenu>
          }
        >
          <div className={css.resetButtonWrap}>
            <Button
              buttonStyle="default"
              disabled={!filterCount}
              id="clickable-reset-all"
              onClick={resetAll}
            >
              <Icon icon="times-circle-solid">
                <FormattedMessage id="stripes-smart-components.resetAll" />
              </Icon>
            </Button>
          </div>
          <FilterGroups
            config={filterConfig}
            filters={appliedFilters}
            onChangeFilter={onChangeFilter}
          />
        </Pane>
      }
      <Pane
        defaultWidth="fill"
        paneTitle={t('mainPane.title')}
        paneSub={t('mainPane.subTitle', { count: totalRecords })}
        appIcon={<ListAppIcon />}
        firstMenu={
          !filterPaneIsVisible ?
            (
              <PaneMenu>
                <ExpandFilterPaneButton
                  filterCount={filterCount}
                  onClick={toggleFilterPane}
                />
              </PaneMenu>
            ) : null
        }
        lastMenu={
          <Link to={CREATE_LIST_URL}>
            <Button
              bottomMargin0
              buttonStyle="primary"
              onClick={noop}
            >
              {t('paneHeader.button.new')}
            </Button>
          </Link>
        }
      >
        <ListsTable
          activeFilters={activeFilters}
          setTotalRecords={setTotalRecords}
        />
      </Pane>
    </Paneset>
  );
};