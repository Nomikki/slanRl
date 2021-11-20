import "@/github/github.scss";
import { Game } from "@/index";
import { ensure } from "@/utils";
import axios from "axios";

const client_id = PRODUCTION ? "29d912f29a2274f9cb81" : "93b9deac9ac0b91c370a";

const backendUrl = PRODUCTION ? "https://roguelike.saunalanit.org/api" : "/api";

const [redirect_uri] = window.location.href.split("?");
const scopes = ["gist"].join(" ");

class GitHub {
  url: URLSearchParams;
  code?: string;
  game?: Game;
  username?: string;

  constructor() {
    const githubLogin = ensure(document.querySelector("#login"));
    const gistSave = ensure(document.querySelector("#save"));
    const gistLoad = ensure(document.querySelector("#load"));
    const githubLogout = ensure(document.querySelector("#logout"));

    githubLogin.addEventListener("click", this.loginToGitHub);
    gistSave.addEventListener("click", this.saveToGists);
    gistLoad.addEventListener("click", this.loadFromGists);
    githubLogout.addEventListener("click", this.logoutFromGitHub);

    this.url = new URLSearchParams(window.location.search);

    this.parseUrl();
  }

  focusOnScreen() {
    ensure(document.querySelector("body")).focus();
  }

  setGame(game: Game) {
    this.game = game;
    this.toggleButtons();
  }

  async parseUrl() {
    if (this.url.has("code")) {
      this.code = ensure(this.url.get("code"));
      history.pushState({}, "Slan Roguelike", redirect_uri);

      const data = {
        code: this.code,
      };

      const options = {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-cache",
        },
      };

      const response = await axios.post(
        `${backendUrl}/access_token`,
        data,
        options,
      );

      response.data.split("&").forEach((param: string) => {
        const [key, value] = param.split("=");
        sessionStorage.setItem(key, value);
      });

      this.toggleButtons();
      this.fetchProfile();
    }
  }

  async fetchProfile() {
    const options = {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
        Authorization: `${sessionStorage.getItem(
          "token_type",
        )} ${sessionStorage.getItem("access_token")}`,
      },
    };

    const response = await axios.get(`${backendUrl}/user`, options);

    this.username = response.data.login;

    sessionStorage.setItem("username", response.data.login);
  }

  loginToGitHub() {
    // Login to GitHub
    console.log("Login");
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=${scopes}&redirect_uri=${redirect_uri}`;
    github.focusOnScreen();
  }

  async saveToGists() {
    // Save to gists
    console.log("Save");

    const values = [];
    for (const key in localStorage) {
      const value = localStorage[key];
      if (typeof value === "string") {
        values.push([key, value]);
      }
    }

    const data = {
      description: "Slan Roguelike - Cloud save",
      public: false,
      files: {
        "slanRl-localStorage.json": {
          content: JSON.stringify(values),
        },
      },
    };

    console.log("data", data);

    const options = {
      headers: {
        Authorization: `${sessionStorage.getItem(
          "token_type",
        )} ${sessionStorage.getItem("access_token")}`,
        Accept: "application/vnd.github.v3+json",
        "Content-type": "application/json",
        "Cache-Control": "no-cache",
      },
    };

    console.log("options", options);

    const slanGist = await github.findGist();

    const method = slanGist?.id ? "patch" : "post";

    const response = await axios[method](
      `${backendUrl}/gists${slanGist?.id ? `/${slanGist?.id}` : ""}`,
      data,
      options,
    );

    console.log("Saved", response);
    github.focusOnScreen();
  }

  async findGist() {
    const options = {
      headers: {
        Authorization: `${sessionStorage.getItem(
          "token_type",
        )} ${sessionStorage.getItem("access_token")}`,
        Accept: "application/vnd.github.v3+json",
        "Content-type": "application/json",
        "Cache-Control": "no-cache",
      },
    };

    const gists = (await axios.get(`${backendUrl}/gists`, options)).data;

    console.log("gists", gists);

    const slanGist = gists.find(
      ({ description }: { description: string }) =>
        description === "Slan Roguelike - Cloud save",
    );

    return slanGist;
  }

  async loadFromGists() {
    // Load from gists
    console.log("Load");

    const options = {
      headers: {
        Authorization: `${sessionStorage.getItem(
          "token_type",
        )} ${sessionStorage.getItem("access_token")}`,
        Accept: "application/vnd.github.v3+json",
        "Content-type": "application/json",
        "Cache-Control": "no-cache",
      },
    };

    const slanGist = await github.findGist();

    const cloudSaves = (
      await axios.get(
        `${backendUrl}/file?file=${slanGist.files["slanRl-localStorage.json"].raw_url}`,
        options,
      )
    ).data;

    cloudSaves.map(([key, value]: [key: string, value: string]) =>
      localStorage.setItem(key, value),
    );

    window.location.reload();

    // ensure(github.game).menu?.clear();
    // const game = ensure(github.game);
    // game.clear();
    // while (true) {
    //   await game.load();
    //   await game.gameloop();
    //   await game.save();
    //   game.log.add("Press Esc to restart");
    //   game.render();
    //   while (true) {
    //     const ch = await game.getch();
    //     if (ch === "Escape") break;
    //   }
    // }

    // ensure(github.game).renderStartMenu();
  }

  logoutFromGitHub() {
    sessionStorage.clear();

    github.toggleButtons();
    github.focusOnScreen();
  }

  toggleButtons() {
    const githubLogin = ensure(document.querySelector("#login"));
    const gistSave = ensure(document.querySelector("#save"));
    const gistLoad = ensure(document.querySelector("#load"));
    const githubLogout = ensure(document.querySelector("#logout"));

    if (this.game?.socket && this.game?.socket.connected) {
      if (sessionStorage.getItem("access_token")) {
        githubLogin.classList.add("hidden");
        if (localStorage.getItem("version")) {
          gistSave.classList.remove("hidden");
        } else {
          gistSave.classList.add("hidden");
        }
        gistLoad.classList.remove("hidden");
        githubLogout.classList.remove("hidden");
      } else {
        githubLogin.classList.remove("hidden");
        gistSave.classList.add("hidden");
        gistLoad.classList.add("hidden");
        githubLogout.classList.add("hidden");
      }
    } else {
      githubLogin.classList.add("hidden");
      gistSave.classList.add("hidden");
      gistLoad.classList.add("hidden");
      githubLogout.classList.add("hidden");
    }
  }
}

const github = new GitHub();
export default github;
