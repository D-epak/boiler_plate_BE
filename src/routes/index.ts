import express from "express";
const router = express.Router();
import user from "./user"
import auth from './auth'

const defaultRoutes = [
  {
    path: "/",
    route: user,
  },{
    path: "/auth",
    route: auth,
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

router.get("/", async (req, res) => {
  return res.send("Server is running");
});


export default router;
