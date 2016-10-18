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
import sortBy from 'lodash/sortBy';
import { connect } from 'react-redux';
import { getLanguages } from '../../../app/store/rootReducer';

class ProjectCardLanguages extends React.Component {
  getLanguageName (key) {
    if (key === '<null>') {
      return 'Unknown';
    }
    const language = this.props.languages[key];
    return language != null ? language.name : key;
  }

  render () {
    const { distribution } = this.props;

    if (distribution == null) {
      return null;
    }

    const parsedLanguages = distribution.split(';').map(item => item.split('='));
    const finalLanguages = sortBy(parsedLanguages, l => -1 * Number(l[1]))
        .slice(0, 2)
        .map(l => this.getLanguageName(l[0]));

    return <span>{finalLanguages.join(', ')}</span>;
  }
}

const mapStateToProps = state => ({
  languages: getLanguages(state)
});

export default connect(mapStateToProps)(ProjectCardLanguages);
