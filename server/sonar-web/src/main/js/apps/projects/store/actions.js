/*
 * SonarQube
 * Copyright (C) 2009-2016 SonarSource SA
 * mailto:contact AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import groupBy from 'lodash/groupBy';
import keyBy from 'lodash/keyBy';
import { searchProjects } from '../../../api/components';
import { addGlobalErrorMessage } from '../../../components/store/globalMessages';
import { parseError } from '../../code/utils';
import { receiveComponents } from '../../../app/store/components/actions';
import { receiveProjects, receiveMoreProjects } from './projects/actions';
import { updateState } from './state/actions';
import { getProjectsAppState } from '../../../app/store/rootReducer';
import { getMeasuresForComponents } from '../../../api/measures';
import { receiveComponentMeasures } from '../../../app/store/measures/actions';

const PAGE_SIZE = 100;

const METRICS = [
  'alert_status',
  'reliability_rating',
  'security_rating',
  'sqale_rating',
  'duplicated_lines_density',
  'coverage',
  'ncloc',
  'ncloc_language_distribution'
];

const onFail = dispatch => error => {
  parseError(error).then(message => dispatch(addGlobalErrorMessage(message)));
  dispatch(updateState({ loading: false }));
};

const onReceiveMeasures = dispatch => projects => response => {
  const projectsById = keyBy(projects, 'id');
  const byComponentId = groupBy(response.measures, 'component');
  Object.keys(byComponentId).forEach(componentId => {
    const componentKey = projectsById[componentId].key;
    const measures = {};
    byComponentId[componentId].forEach(measure => {
      measures[measure.metric] = measure.value;
    });
    dispatch(receiveComponentMeasures(componentKey, measures));
  });
};

const fetchProjectMeasures = projects => dispatch => {
  const projectKeys = projects.map(project => project.key);
  return getMeasuresForComponents(projectKeys, METRICS).then(onReceiveMeasures(dispatch)(projects), onFail(dispatch));
};

const onReceiveProjects = dispatch => response => {
  dispatch(receiveComponents(response.components));
  dispatch(receiveProjects(response.components));
  dispatch(fetchProjectMeasures(response.components)).then(() => {
    dispatch(updateState({ loading: false }));
  });
  dispatch(updateState({
    total: response.paging.total,
    pageIndex: response.paging.pageIndex,
  }));
};

const onReceiveMoreProjects = dispatch => response => {
  dispatch(receiveComponents(response.components));
  dispatch(receiveMoreProjects(response.components));
  dispatch(fetchProjectMeasures(response.components)).then(() => {
    dispatch(updateState({ loading: false }));
  });
  dispatch(updateState({ pageIndex: response.paging.pageIndex }));
};

export const fetchProjects = () => dispatch => {
  dispatch(updateState({ loading: true }));
  return searchProjects({ ps: PAGE_SIZE }).then(onReceiveProjects(dispatch), onFail(dispatch));
};

export const fetchMoreProjects = () => (dispatch, getState) => {
  dispatch(updateState({ loading: true }));
  const { pageIndex } = getProjectsAppState(getState());
  return searchProjects({ ps: PAGE_SIZE, p: pageIndex + 1 }).then(onReceiveMoreProjects(dispatch), onFail(dispatch));
};

