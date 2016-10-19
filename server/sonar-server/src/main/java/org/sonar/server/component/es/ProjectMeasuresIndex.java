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
package org.sonar.server.component.es;

import java.util.Set;
import org.elasticsearch.action.search.SearchRequestBuilder;
import org.elasticsearch.index.query.BoolQueryBuilder;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.sort.SortOrder;
import org.sonar.server.component.es.ProjectMeasuresQuery.MetricCriteria;
import org.sonar.server.es.BaseIndex;
import org.sonar.server.es.EsClient;
import org.sonar.server.es.SearchIdResult;
import org.sonar.server.es.SearchOptions;
import org.sonar.server.user.UserSession;

import static org.elasticsearch.index.query.QueryBuilders.boolQuery;
import static org.elasticsearch.index.query.QueryBuilders.matchAllQuery;
import static org.elasticsearch.index.query.QueryBuilders.nestedQuery;
import static org.elasticsearch.index.query.QueryBuilders.rangeQuery;
import static org.elasticsearch.index.query.QueryBuilders.termQuery;
import static org.sonar.server.component.es.ProjectMeasuresIndexDefinition.FIELD_AUTHORIZATION_GROUPS;
import static org.sonar.server.component.es.ProjectMeasuresIndexDefinition.FIELD_AUTHORIZATION_USERS;
import static org.sonar.server.component.es.ProjectMeasuresIndexDefinition.FIELD_MEASURES;
import static org.sonar.server.component.es.ProjectMeasuresIndexDefinition.FIELD_MEASURES_KEY;
import static org.sonar.server.component.es.ProjectMeasuresIndexDefinition.FIELD_MEASURES_VALUE;
import static org.sonar.server.component.es.ProjectMeasuresIndexDefinition.FIELD_NAME;
import static org.sonar.server.component.es.ProjectMeasuresIndexDefinition.INDEX_PROJECT_MEASURES;
import static org.sonar.server.component.es.ProjectMeasuresIndexDefinition.TYPE_AUTHORIZATION;
import static org.sonar.server.component.es.ProjectMeasuresIndexDefinition.TYPE_PROJECT_MEASURES;

public class ProjectMeasuresIndex extends BaseIndex {

  private static final String FIELD_KEY = FIELD_MEASURES + "." + FIELD_MEASURES_KEY;
  private static final String FIELD_VALUE = FIELD_MEASURES + "." + FIELD_MEASURES_VALUE;

  private final UserSession userSession;

  public ProjectMeasuresIndex(EsClient client, UserSession userSession) {
    super(client);
    this.userSession = userSession;
  }

  public SearchIdResult<String> search(ProjectMeasuresQuery query, SearchOptions searchOptions) {
    QueryBuilder esQuery = createEsQuery(query);

    SearchRequestBuilder request = getClient()
      .prepareSearch(INDEX_PROJECT_MEASURES)
      .setTypes(TYPE_PROJECT_MEASURES)
      .setFetchSource(false)
      .setQuery(esQuery)
      .setFrom(searchOptions.getOffset())
      .setSize(searchOptions.getLimit())
      .addSort(FIELD_NAME + "." + SORT_SUFFIX, SortOrder.ASC);

    return new SearchIdResult<>(request.get(), id -> id);
  }

  private QueryBuilder createEsQuery(ProjectMeasuresQuery query) {
    BoolQueryBuilder filters = boolQuery()
      .must(createAuthorizationFilter());
    query.getMetricCriteria().stream()
      .map(criteria -> nestedQuery(FIELD_MEASURES, boolQuery()
        .filter(termQuery(FIELD_KEY, criteria.getMetricKey()))
        .filter(toValueQuery(criteria))))
      .forEach(filters::filter);
    return filters;
  }

  private static QueryBuilder toValueQuery(MetricCriteria criteria) {
    String fieldName = FIELD_VALUE;

    switch (criteria.getOperator()) {
      case GT:
        return rangeQuery(fieldName).gt(criteria.getValue());
      case LTE:
        return rangeQuery(fieldName).lte(criteria.getValue());
      default:
        throw new IllegalStateException("Metric criteria non supported: " + criteria.getOperator().name());
    }
  }

  private QueryBuilder createAuthorizationFilter() {
    String userLogin = userSession.getLogin();
    Set<String> userGroupNames = userSession.getUserGroups();
    BoolQueryBuilder groupsAndUser = boolQuery();
    if (userLogin != null) {
      groupsAndUser.should(termQuery(FIELD_AUTHORIZATION_USERS, userLogin));
    }
    for (String group : userGroupNames) {
      groupsAndUser.should(termQuery(FIELD_AUTHORIZATION_GROUPS, group));
    }
    return QueryBuilders.hasParentQuery(TYPE_AUTHORIZATION,
      QueryBuilders.boolQuery().must(matchAllQuery()).filter(groupsAndUser));
  }
}
