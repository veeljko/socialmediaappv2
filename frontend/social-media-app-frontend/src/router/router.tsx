import {
  createBrowserRouter,
  redirect,
} from "react-router-dom";
import HomePage from "@/pages/HomePage";
import ProfilePage from "@/pages/ProfilePage";
import { store } from "@/app/store";
import { authApi } from "@/services/authApi";
import ErrorPage from "@/pages/ErrorPage";
import PostPage from "@/pages/PostPage";
import NotAuthedHomePage from "@/pages/NotAuthedHomePage";
import MainLayout from "@/layouts/MainLayout";
import MessagesPage from "@/pages/MessagesPage";

const requireAuthedUser = async () => {
  const user = await store.dispatch(
    authApi.endpoints.getAuthedUserInfo.initiate(undefined, { subscribe: false })
  );

  if (!user.data) {
    throw redirect("/login");
  }
};

export const router = createBrowserRouter([
  {
    id: "root",
    path: "/",
    loader: requireAuthedUser,
    middleware: [
      
    ],
    Component: MainLayout,
    ErrorBoundary: ErrorPage,
    children: [
      {
        path: "/",
        Component: HomePage
      },
      {
        path: "/profile/:profileId",
        Component: ProfilePage,
      },
      {
        path: "/post/:postId",
        Component: PostPage
      }
    ],
  },
  {
    path: "/messages",
    loader: requireAuthedUser,
    Component: MessagesPage,
    ErrorBoundary: ErrorPage,
  },
  {
    path: "/login",
    Component: NotAuthedHomePage,
    middleware: [async ({ request: _request }, next) => {
      const user = await store.dispatch(authApi.endpoints.getAuthedUserInfo.initiate(undefined, {subscribe : false}));
      if (user.data) {
        throw redirect("/");
      }

      return next();
    }]
  }
]);


