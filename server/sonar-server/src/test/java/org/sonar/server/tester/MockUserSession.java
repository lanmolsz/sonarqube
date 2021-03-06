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
package org.sonar.server.tester;

import java.util.Objects;

import static com.google.common.base.Preconditions.checkArgument;

public class MockUserSession extends AbstractMockUserSession<MockUserSession> {
  private final String login;
  private boolean root = false;
  private Integer userId;
  private String name;

  public MockUserSession(String login) {
    super(MockUserSession.class);
    checkArgument(!login.isEmpty());
    this.login = login;
    setUserId(login.hashCode());
    setName(login + " name");
  }

  @Override
  public boolean isLoggedIn() {
    return true;
  }

  @Override
  public boolean isRoot() {
    return root;
  }

  public void setRoot(boolean root) {
    this.root = root;
  }

  @Override
  public String getLogin() {
    return this.login;
  }

  @Override
  public String getName() {
    return this.name;
  }

  public MockUserSession setName(String s) {
    this.name = Objects.requireNonNull(s);
    return this;
  }

  @Override
  public Integer getUserId() {
    return this.userId;
  }

  public MockUserSession setUserId(int userId) {
    this.userId = userId;
    return this;
  }

}
