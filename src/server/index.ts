import express, { Express, Request, Response, NextFunction } from "express";
import path from "path";
import ViteExpress from "vite-express";
import "dotenv/config";
import fs from "fs/promises";
import * as settings from "./settings.js";

const app: Express = express();

app.use(
    "/assets",
    express.static(
        settings.IS_PRODUCTION
            ? path.join(settings.__dirname, "..", "public", "assets")
            : path.join(settings.__dirname, "..", "client", "assets")
    )
);

app.use(ViteExpress.static());

// API Routes
app.get("/api/directories", async (req: Request, res: Response) => {
    try {
        const files = await fs.readdir(
            settings.IS_PRODUCTION ? path.join(settings.__dirname, "..", "public") : path.join(settings.CLIENT_PATH, "pages")
        );
        const dirs = files.filter((el) => !el.includes(".") && !el.includes("assets"));

        res.json(dirs);
    } catch (err) {
        res.status(500).json({ err });
    }
});

// Vite Stuff
app.get("*$", (req: Request, res: Response, next: NextFunction) => {
    const { path } = req;
    if (path !== "/" && !path.endsWith("/") && !path.includes(".") && !path.includes("@")) {
        res.redirect(path + "/");
    } else {
        next();
    }
});

ViteExpress.config({
    viteConfigFile: path.join(settings.__dirname, "../../vite.config.ts"),
});

ViteExpress.listen(app, settings.PORT, () => {
    console.log(`Server listening on port ${settings.PORT}`);
    console.log("View the project at: ", `${settings.PROTOCOL}://${settings.HOST}:${settings.PORT}`);
});
