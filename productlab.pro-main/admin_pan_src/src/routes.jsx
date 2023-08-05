import React from "react";


import { Routes as ReactRouters, Route } from "react-router-dom";

import {
  NotFound,
  AllArticlesPage,
  CategoriesPage,
  ArticlePage,
  NewArticlePage,
  UsersPage,
  SettingsPage,
  FilesPage,
  AcademyPage,
  AcademyArticlePage,
  EditArticlePage,
  DismissedPage,
  SurveysPage,
  CreateSurveyPage,
  EditSurveyPage,
  ViewSurveyPage,
  RegistryAnswersPage
} from "./pages";

import { userConstants } from "./store/slices/userSlice";

const routes = [
  {
    path: "/",
    Page: AllArticlesPage,
    availableUser: [
      userConstants.role.ADMIN,
      userConstants.role.COPYWRITER,
      userConstants.role.MANAGER,
      userConstants.role.default
    ]
  },
  {
    path: "/categories",
    Page: CategoriesPage,
    availableUser: [
      userConstants.role.ADMIN,
      userConstants.role.COPYWRITER,
      userConstants.role.MANAGER,
      userConstants.role.default
    ]
  },
  {
    path: "/article/:id",
    Page: ArticlePage,
    availableUser: [
      userConstants.role.ADMIN,
      userConstants.role.COPYWRITER,
      userConstants.role.MANAGER,
      userConstants.role.default
    ]
  },
  {
    path: "/new",
    Page: NewArticlePage,
    availableUser: [
      userConstants.role.ADMIN,
      userConstants.role.MANAGER,
      userConstants.role.COPYWRITER,
    ]
  },
  {
    path: "/edit",
    Page: EditArticlePage,
    availableUser: [
      userConstants.role.ADMIN,
      userConstants.role.MANAGER,
      userConstants.role.COPYWRITER
    ]
  },
  {
    path: "/users",
    Page: UsersPage,
    availableUser: [
      userConstants.role.ADMIN,
    ]
  },
  {
    path: "/settings",
    Page: SettingsPage,
    availableUser: [
      userConstants.role.ADMIN,
    ]
  },
  {
    path: '/files',
    Page: FilesPage,
    availableUser: [
      userConstants.role.ADMIN,
    ]
  },
  {
    path: "/academy",
    Page: AcademyPage,
    availableUser: [
      userConstants.role.ADMIN,
      userConstants.role.MANAGER,
      userConstants.role.STUDENT,
    ]
  },
  {
    path: "/academy/:category_id/:article_id/:progress",
    Page: AcademyArticlePage,
    availableUser: [
      userConstants.role.ADMIN,
      userConstants.role.MANAGER,
      userConstants.role.STUDENT,
    ]
  },
  {
    path: "/surveys/:type/:category_ids",
    Page: SurveysPage,
    availableUser: [
      userConstants.role.ADMIN,
      userConstants.role.MANAGER,
      userConstants.role.STUDENT,
      userConstants.role.default
    ]
  },
  {
    path: "/surveys/create-survey",
    Page: CreateSurveyPage,
    availableUser: [
      userConstants.role.ADMIN,
    ]
  },
  {
    path: "/surveys/edit-survey/:sid",
    Page: EditSurveyPage,
    availableUser: [
      userConstants.role.ADMIN,
    ]
  },
  {
    path: "/surveys/passage/:sid",
    Page: ViewSurveyPage,
    availableUser: [
      userConstants.role.ADMIN,
      userConstants.role.MANAGER,
      userConstants.role.STUDENT,
      userConstants.role.default
    ]
  },
  {
    path: "/surveys/registry-answers",
    Page: RegistryAnswersPage,
    availableUser: [
      userConstants.role.ADMIN,
    ]
  }
]


const Routes = ({ token, user }) => {

  const userRole = user.data?.role || userConstants.role.default

  return user?.is_dismissed ?
    <DismissedPage /> : <ReactRouters>
      <Route path="*" element={<NotFound token={token} role={userRole} />} />
      {routes.map((route, key) => {
        const { Page, path, availableUser } = route

        if (availableUser.includes(userRole)) {
          return <Route key={key} path={path} element={<Page token={token} />} />
        }

        return null

      })}

    </ReactRouters>
};

export { Routes }