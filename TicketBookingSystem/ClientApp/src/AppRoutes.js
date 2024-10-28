import { Home } from "./components/pages/Home";
import { Profile } from "./components/pages/Profile";
import { Panel } from "./components/pages/Panel";
import { TicketCart } from "./components/pages/TicketCart";
import { Login } from "./components/authorizePages/Login";
import { Register } from "./components/authorizePages/Register";
import { ConfirmAuth } from "./components/authorizePages/ConfirmAuth";

const AppRoutes = [
  {
    index: true,
    element: <Home />
  },
  {
    path: '/auth/confirm',
    element: <ConfirmAuth/>,
  },
  {
    path: '/auth/login',
    element: <Login/>
  },
  {
    path: '/auth/register',
    element: <Register/>
  },
  {
      path: '/tickets-cart',
      element: <TicketCart />
    },
  {
      path: '/profile',
      element: <Profile />
  },
  {
      path: '/panel',
      element: <Panel />
  },
];

export default AppRoutes;
