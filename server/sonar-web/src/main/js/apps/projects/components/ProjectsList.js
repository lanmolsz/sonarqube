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
import React from 'react';
import { List, AutoSizer, WindowScroller } from 'react-virtualized';
import ProjectCardContainer from './ProjectCardContainer';
import ProjectsListFooterContainer from './ProjectsListFooterContainer';

export default class ProjectsList extends React.Component {
  static propTypes = {
    projects: React.PropTypes.arrayOf(React.PropTypes.string)
  };

  render () {
    const { projects } = this.props;

    if (projects == null) {
      return null;
    }

    const rowRenderer = ({ key, index, style }) => {
      const projectKey = projects[index];
      return (
          <div key={key} style={style}>
            <ProjectCardContainer projectKey={projectKey}/>
          </div>
      );
    };

    return (
        <div className="page page-limited">
          <div className="projects-list-wrapper">
            <WindowScroller>
              {({ height, isScrolling, scrollTop }) => (
                  <AutoSizer disableHeight>
                    {({ width }) => (
                        <List
                            className="projects-list"
                            autoHeight
                            width={width}
                            height={height}
                            rowCount={projects.length}
                            rowHeight={135}
                            rowRenderer={rowRenderer}
                            scrollTop={scrollTop}/>
                    )}
                  </AutoSizer>
              )}
            </WindowScroller>
            <ProjectsListFooterContainer/>
          </div>
        </div>
    );
  }
}
