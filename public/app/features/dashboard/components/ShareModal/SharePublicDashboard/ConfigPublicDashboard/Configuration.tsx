import { css } from '@emotion/css';
import React from 'react';
import { UseFormRegister } from 'react-hook-form';

import { GrafanaTheme2 } from '@grafana/data/src';
import { selectors as e2eSelectors } from '@grafana/e2e-selectors/src';
import { reportInteraction } from '@grafana/runtime/src';
import { FieldSet, Label, Switch, TimeRangeInput, useStyles2, VerticalGroup } from '@grafana/ui/src';
import { Layout } from '@grafana/ui/src/components/Layout/Layout';
import { DashboardModel } from 'app/features/dashboard/state';
import { getTimeRange } from 'app/features/dashboard/utils/timeRange';

import { SharePublicDashboardInputs } from './ConfigPublicDashboard';

export const Configuration = ({
  disabled,
  dashboard,
  register,
}: {
  disabled: boolean;
  dashboard: DashboardModel;
  register: UseFormRegister<SharePublicDashboardInputs>;
}) => {
  const selectors = e2eSelectors.pages.ShareDashboardModal.PublicDashboard;
  const styles = useStyles2(getStyles);

  const timeRange = getTimeRange(dashboard.getDefaultTime(), dashboard);

  return (
    <>
      <h4 className={styles.title}>Settings</h4>
      <FieldSet disabled={disabled} className={styles.dashboardConfig}>
        <VerticalGroup spacing="md">
          <Layout orientation={1} spacing="xs" justify="space-between">
            <Label description="The public dashboard uses the default time range settings of the dashboard">
              Default time range
            </Label>
            <TimeRangeInput value={timeRange} disabled onChange={() => {}} />
          </Layout>
          <Layout orientation={0} spacing="sm">
            <Switch {...register('isTimeRangeEnabled')} data-testid={selectors.EnableTimeRangeSwitch} />
            <Label description="Allow viewers to change time range">Time range picker enabled</Label>
          </Layout>
          <Layout orientation={0} spacing="sm">
            <Switch
              {...register('isAnnotationsEnabled')}
              onChange={(e) => {
                const { onChange } = register('isAnnotationsEnabled');
                reportInteraction('grafana_dashboards_annotations_clicked', {
                  action: e.currentTarget.checked ? 'enable' : 'disable',
                });
                onChange(e);
              }}
              data-testid={selectors.EnableAnnotationsSwitch}
            />
            <Label description="Show annotations on public dashboard">Show annotations</Label>
          </Layout>
        </VerticalGroup>
      </FieldSet>
    </>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  title: css`
    margin-bottom: ${theme.spacing(1)};
  `,
  dashboardConfig: css`
    margin: ${theme.spacing(0, 0, 3, 0)};
  `,
});
