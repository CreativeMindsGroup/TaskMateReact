import { MainLayout } from "../Layouts/MainLayout";
import { Navigate, useRoutes } from "react-router";
import SignInPage from "../Pages/SignInPage/SignInPage";
import RegisterPage from "../Pages/SignInPage/RegisterPage";
import { useSelector } from "react-redux";
import Members from "../Components/Members/Members";
import Invite from "../Pages/Invite/Invite";
import InviteBoard from "../Pages/InviteBoard/InviteBoard";
import Footer from "../Art/Footer";
import NotFountPage from "../Pages/NotFountPage";
import WelcomePage from "../Pages/WelcomePage/WelcomePage";
import BoardsPage from "../Pages/BoardPage/BoardsPage";

export default function Routes() {
  const { token } = useSelector((x) => x.auth);
  let routes = [
    {
      path: "/",
      element: <MainLayout />,
      children: [
        {
          path: "/Boards/:id",
          element: token ? <BoardsPage /> : <Navigate to={"/SignIn"} />,
        },
        {
          path: "/",
          element: token ? <WelcomePage /> : <Navigate to={"/SignIn"} />,
        },
        {
          path: "/Members",
          element: token ? <Members /> : <Navigate to={"/SignIn"} />,
        },
      ],
    },
    {
      path: "/",
      children: [
        {
          path: "/SignIn",
          element: <SignInPage />,
        },
        {
          path: "/CreateUser",
          element: token ?  <RegisterPage></RegisterPage> : <Navigate to={"/SignIn"} />,
        },
        {
          path: "/Invite/:generateGuidId/:linkSelectedWorkspaceId/:userId",
          element: <Invite />,
        },
        {
          path: "/InviteBoard/:generateGuidId/:linkSelectedWorkspaceId/:linkBoardId/:userId",
          element: <InviteBoard />,
        },
      ],
    },
    {
      path: "/Footer",
      element: <Footer />,
    },
    {
      path: "/*",
      element: <NotFountPage />,
    },
  ];
  return useRoutes(routes);
}
