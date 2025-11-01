// netlify/functions/api.js
import express from "express";
import serverless from "serverless-http";

const app = express();
app.get("/", (req, res) => res.json({ msg: "Express on Netlify!" }));

export const handler = serverless(app);
