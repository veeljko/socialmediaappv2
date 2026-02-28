import * as ReactDOM from "react-dom";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import AuthHandler from "../pages/AuthHandler"
import HomePage from "@/pages/HomePage";
import UserProfilePage from "@/pages/UserProfilePage";
import ProfilePage from "@/pages/ProfilePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthHandler />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/profile/:profileId",
        element: <ProfilePage/>
      }
    ],
  },
]);


