import * as ReactDOM from "react-dom";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import AuthHandler from "../pages/AuthHandler"
import HomePage from "@/pages/HomePage";
import UserProfilePage from "@/pages/UserProfilePage";

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
        path: "/userprofile",
        element: <UserProfilePage/>
      }
    ],
  },
]);


