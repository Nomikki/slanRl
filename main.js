/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/actor.js":
/*!**********************!*\
  !*** ./src/actor.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Actor)\n/* harmony export */ });\n/* harmony import */ var ___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! . */ \"./src/index.js\");\n\r\n\r\n\r\n\r\nclass Actor {\r\n  constructor(x, y, ch, name, color) {\r\n    this.x = x | 0;\r\n    this.y = y | 0;\r\n    this.ch = ch;\r\n    this.color = color;\r\n    this.name = name;\r\n\r\n    this.fov = null;\r\n    this.fovOnly = true;\r\n  }\r\n\r\n  render() {\r\n    const fovValue = ___WEBPACK_IMPORTED_MODULE_0__.game.player.fov.getMapped(this.x, this.y);\r\n    if (fovValue === 2 || (fovValue != 0 && !this.fovOnly)) {\r\n      ___WEBPACK_IMPORTED_MODULE_0__.game.drawChar(this.ch, this.x, this.y, this.color);\r\n    }\r\n  }\r\n\r\n  update() {\r\n    \r\n    console.log(\"The \" + this.name + \" growls!\");\r\n  }\r\n\r\n  computeFov() {\r\n    if (this.fov) {\r\n      this.fov.compute(this.x, this.y, 10);\r\n    }\r\n  }\r\n\r\n  moveOrAttack(x, y) {\r\n    if (___WEBPACK_IMPORTED_MODULE_0__.game.map.isWall(x, y)) return false;\r\n    for (let i = 0; i < ___WEBPACK_IMPORTED_MODULE_0__.game.actors.length; i++) {\r\n      const actor = ___WEBPACK_IMPORTED_MODULE_0__.game.actors[i];\r\n      if (actor.x === x && actor.y === y && actor !== this) {\r\n        console.log(\"The \" + actor.name + \" laughs at your puny efforts to attack him!\");\r\n        return false;\r\n      }\r\n    }\r\n\r\n    this.x = x;\r\n    this.y = y;\r\n    return true;\r\n  }\r\n}\r\n\n\n//# sourceURL=webpack:///./src/actor.js?");

/***/ }),

/***/ "./src/bsp_generator.js":
/*!******************************!*\
  !*** ./src/bsp_generator.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _rectangle_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rectangle.js */ \"./src/rectangle.js\");\n/* harmony import */ var _bsp_node_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./bsp_node.js */ \"./src/bsp_node.js\");\n/* harmony import */ var _random_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./random.js */ \"./src/random.js\");\n\r\n\r\n\r\n\r\n\r\n\r\nconst random = new _random_js__WEBPACK_IMPORTED_MODULE_2__[\"default\"]();\r\n\r\nclass bspGenerator {\r\n  constructor(x, y, w, h, maxLevel = 5) {\r\n    this.maxLevel = maxLevel;\r\n\r\n    this.rootContainer = new _rectangle_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](x + 1, y + 1, w - 2, h - 2);\r\n\r\n    this.rows = h;\r\n    this.cols = w;\r\n\r\n    this.map = [];\r\n    this.doorPlaces = [];\r\n    this.tempRooms = [];\r\n\r\n    for (let h = 0; h < this.rows; h++) {\r\n      for (let w = 0; w < this.cols; w++) {\r\n        const index = this.cols * h + w;\r\n        this.map[index] = 1;\r\n      }\r\n    }\r\n\r\n    this.tree = this.Devide(this.rootContainer, 0);\r\n    this.rooms = this.tree.GetLeafs();\r\n    this.CreateRooms();\r\n    this.ConnectRooms(this.tree);\r\n  }\r\n\r\n  RandomSplit(container) {\r\n    let r1, r2;\r\n\r\n    let splitVertical = random.getInt(0, 1);\r\n\r\n    if (container.w > container.h && container.w / container.h >= 0.05) {\r\n      splitVertical = true;\r\n    } else {\r\n      splitVertical = false;\r\n    }\r\n\r\n    if (splitVertical) {\r\n      //Vertical\r\n      const w = random.getInt(container.w * 0.3, container.w * 0.6);\r\n      r1 = new _rectangle_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](container.x, container.y, w, container.h);\r\n      r2 = new _rectangle_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](\r\n        container.x + w,\r\n        container.y,\r\n        container.w - w,\r\n        container.h\r\n      );\r\n    } else {\r\n      //horizontal\r\n      const h = random.getInt(container.h * 0.3, container.h * 0.6);\r\n      r1 = new _rectangle_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](container.x, container.y, container.w, h);\r\n      r2 = new _rectangle_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](\r\n        container.x,\r\n        container.y + h,\r\n        container.w,\r\n        container.h - h\r\n      );\r\n    }\r\n    return [r1, r2];\r\n  }\r\n\r\n  Devide(container, level) {\r\n    const root = new _bsp_node_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"](container);\r\n\r\n    if (level < this.maxLevel) {\r\n      const sr = this.RandomSplit(container);\r\n      root.A = this.Devide(sr[0], level + 1);\r\n      root.B = this.Devide(sr[1], level + 1);\r\n    }\r\n    return root;\r\n  }\r\n\r\n  CreateRooms() {\r\n    for (let i = 0; i < this.rooms.length; i++) {\r\n      const w = random.getInt(this.rooms[i].w * 0.5, this.rooms[i].w * 0.9);\r\n      const h = random.getInt(this.rooms[i].h * 0.5, this.rooms[i].h * 0.9);\r\n      const x = random.getInt(\r\n        this.rooms[i].x,\r\n        this.rooms[i].x + this.rooms[i].w - w\r\n      );\r\n      const y = random.getInt(\r\n        this.rooms[i].y,\r\n        this.rooms[i].y + this.rooms[i].h - h\r\n      );\r\n\r\n      let rect = new _rectangle_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](x, y, x + w, y + h);\r\n      this.tempRooms.push(rect);\r\n\r\n      for (let hi = y; hi < y + h; hi++) {\r\n        for (let wi = x; wi < x + w; wi++) {\r\n          const index = this.cols * hi + wi;\r\n          this.map[index] = 0;\r\n        }\r\n      }\r\n    }\r\n  }\r\n\r\n  IsThereRoom(x, y) {\r\n    for (let i = 0; i < this.tempRooms.length; i++) {\r\n      if (\r\n        x >= this.tempRooms[i].x &&\r\n        y >= this.tempRooms[i].y &&\r\n        x <= this.tempRooms[i].w &&\r\n        y <= this.tempRooms[i].h\r\n      ) {\r\n        return true;\r\n      }\r\n    }\r\n    return false;\r\n  }\r\n\r\n  ConnectRooms(node) {\r\n    if (node.A === null || node.B === null) return false;\r\n\r\n    const x1 = node.A.leaf.GetCenterX() >> 0;\r\n    const y1 = node.A.leaf.GetCenterY() >> 0;\r\n\r\n    const x2 = node.B.leaf.GetCenterX() >> 0;\r\n    const y2 = node.B.leaf.GetCenterY() >> 0;\r\n\r\n    let doorsCreated = false;\r\n    let lastWasInRoom = false;\r\n\r\n    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {\r\n      const index = this.cols * Math.max(y1, y2) + x;\r\n      this.map[index] = 0;\r\n\r\n      if (!doorsCreated && this.IsThereRoom(x, Math.max(y1, y2)) === true) {\r\n        lastWasInRoom = true;\r\n      } else if (\r\n        !doorsCreated &&\r\n        this.IsThereRoom(x, Math.max(y1, y2)) === false\r\n      ) {\r\n        if (lastWasInRoom === true) {\r\n          doorsCreated = true;\r\n          let re = new _rectangle_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](x, Math.max(y1, y2), 0, 0);\r\n          this.doorPlaces.push(re);\r\n        }\r\n      }\r\n    }\r\n    doorsCreated = false;\r\n\r\n    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {\r\n      const index = this.cols * y + Math.max(x1, x2);\r\n      this.map[index] = 0;\r\n      if (!doorsCreated && this.IsThereRoom(Math.max(x1, x2), y) === true) {\r\n        lastWasInRoom = true;\r\n      } else if (\r\n        !doorsCreated &&\r\n        this.IsThereRoom(Math.max(x1, x2), y) === false\r\n      ) {\r\n        if (lastWasInRoom === true) {\r\n          doorsCreated = true;\r\n          let re = new _rectangle_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](Math.max(x1, x2), y, 0, 0);\r\n          this.doorPlaces.push(re);\r\n        }\r\n      }\r\n    }\r\n\r\n    this.ConnectRooms(node.A);\r\n    this.ConnectRooms(node.B);\r\n  }\r\n}\r\n\r\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (bspGenerator);\r\n\n\n//# sourceURL=webpack:///./src/bsp_generator.js?");

/***/ }),

/***/ "./src/bsp_node.js":
/*!*************************!*\
  !*** ./src/bsp_node.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _rectangle_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rectangle.js */ \"./src/rectangle.js\");\n\r\n\r\n\r\n\r\nclass bspNode extends _rectangle_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"] {\r\n  constructor(leaf) {\r\n    super(leaf);\r\n    this.A = null;\r\n    this.B = null;\r\n    this.leaf = leaf;\r\n  }\r\n\r\n  GetLeafs() {\r\n    if (this.A === null && this.B === null) {\r\n      return [this.leaf];\r\n    } else {\r\n      return [].concat(this.A.GetLeafs(), this.B.GetLeafs());\r\n    }\r\n  }\r\n}\r\n\r\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (bspNode);\r\n\n\n//# sourceURL=webpack:///./src/bsp_node.js?");

/***/ }),

/***/ "./src/fov.js":
/*!********************!*\
  !*** ./src/fov.js ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Fov)\n/* harmony export */ });\n/* harmony import */ var ___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! . */ \"./src/index.js\");\n\r\n\r\n\r\n\r\nclass Fov {\r\n  constructor(w, h) {\r\n    this.width = w;\r\n    this.height = h;\r\n\r\n    this.mapped = new Array(this.width * this.height).fill(0);\r\n  }\r\n\r\n  clear() {\r\n    for (let i = 0; i < this.width * this.height; i++) {\r\n      if (this.mapped[i] === 2) {\r\n        this.mapped[i] = 1;\r\n      }\r\n    }\r\n  }\r\n\r\n  fullClear() {\r\n    this.mapped = new Array(this.width * this.height).fill(0);\r\n  }\r\n\r\n  float2int(value) {\r\n    return value | 0;\r\n  }\r\n\r\n  /* Just a placeholder */\r\n  compute(x, y, len) {\r\n    this.clear();\r\n\r\n    let dx = 0;\r\n    let dy = 0;\r\n    let px = 0;\r\n    let py = 0;\r\n\r\n    this.mapped[x + y * this.width] = 2;\r\n\r\n    for (let a = 0; a < 360; a++) {\r\n      dx = Math.sin((a / 3.1415) * 180.0);\r\n      dy = Math.cos((a / 3.1415) * 180.0);\r\n\r\n      px = x + 0.5;\r\n      py = y + 0.5;\r\n\r\n      for (let l = 0; l < len; l++) {\r\n        px += dx;\r\n        py += dy;\r\n\r\n        if (px <= 0 || px >= this.width || py <= 0 || py >= this.height) {\r\n          break;\r\n        }\r\n\r\n        const id = this.float2int(px) + this.float2int(py) * this.width;\r\n        this.mapped[id] = 2;\r\n\r\n        if (___WEBPACK_IMPORTED_MODULE_0__.game.map.isWall(this.float2int(px), this.float2int(py)) === true) {\r\n          break;\r\n        }\r\n      }\r\n    }\r\n  }\r\n\r\n  getMapped(x, y) {\r\n    if (x >= 0 && y >= 0 && x < this.width && y < this.height)\r\n      return this.mapped[x + y * this.width];\r\n    else return 2;\r\n  }\r\n}\r\n\n\n//# sourceURL=webpack:///./src/fov.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"game\": () => (/* binding */ game)\n/* harmony export */ });\n/* harmony import */ var _actor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./actor */ \"./src/actor.js\");\n/* harmony import */ var _map__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./map */ \"./src/map.js\");\n/* harmony import */ var _fov__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./fov */ \"./src/fov.js\");\n\r\n\r\n\r\n\r\n\r\n\r\nclass Game {\r\n  constructor() {\r\n    this.GameStatus = Object.freeze({\r\n      STARTUP: 0,\r\n      IDLE: 1,\r\n      NEW_TURN: 2,\r\n      VICTORY: 3,\r\n      DEFEAT: 4,\r\n    });\r\n\r\n    this.gameStatus = this.GameStatus.STARTUP;\r\n  }\r\n\r\n  init() {\r\n    this.canvas = document.getElementById(\"screen\");\r\n    this.ctx = this.canvas.getContext(\"2d\");\r\n    this.ctx.font = \"12px Arial\";\r\n    this.fontSize = 12;\r\n    this.lastKey = 0;\r\n\r\n    this.width = 80;\r\n    this.height = 40;\r\n\r\n    this.actors = new Array();\r\n    this.actors.push(new _actor__WEBPACK_IMPORTED_MODULE_0__[\"default\"](2, 2, \"@\", \"hero\", \"#CCC\"));\r\n\r\n    this.player = this.actors[0];\r\n    this.player.fov = new _fov__WEBPACK_IMPORTED_MODULE_2__[\"default\"](this.width, this.height);\r\n\r\n    this.map = new _map__WEBPACK_IMPORTED_MODULE_1__[\"default\"](this.width, this.height);\r\n\r\n    this.map.generate(Math.random() * 32000);\r\n    this.player.x = this.map.startX;\r\n    this.player.y = this.map.startY;\r\n    this.player.fov.fullClear();\r\n  }\r\n\r\n  clear(color = \"#000\") {\r\n    this.ctx.fillStyle = color;\r\n    this.ctx.fillRect(\r\n      0,\r\n      0,\r\n      this.width * this.fontSize,\r\n      this.height * this.fontSize\r\n    );\r\n  }\r\n\r\n  drawChar(ch, x, y, color = \"#000\") {\r\n    this.ctx.fillStyle = \"#040404\";\r\n    this.ctx.fillRect(\r\n      x * this.fontSize,\r\n      y * this.fontSize,\r\n      this.fontSize,\r\n      this.fontSize\r\n    );\r\n\r\n    this.ctx.fillStyle = color;\r\n    this.ctx.fillText(ch, x * this.fontSize, y * this.fontSize + this.fontSize);\r\n  }\r\n\r\n  run() {\r\n    this.init();\r\n    this.update();\r\n  }\r\n\r\n  waitingKeypress() {\r\n    return new Promise((resolve) => {\r\n      document.addEventListener(\"keydown\", onKeyHandler);\r\n      function onKeyHandler(e) {\r\n        if (e.keyCode !== 0) {\r\n          document.removeEventListener(\"keydown\", onKeyHandler);\r\n          game.lastKey = e.key;\r\n          resolve();\r\n        }\r\n      }\r\n    });\r\n  }\r\n\r\n  //wait keypress and return key\r\n  async getch() {\r\n    await this.waitingKeypress();\r\n    const tempKey = this.lastKey;\r\n    this.lastKey = 0;\r\n    return tempKey;\r\n  }\r\n\r\n  render() {\r\n    this.clear();\r\n\r\n    this.map.render();\r\n    this.drawChar(\"@\", this.playerX, this.playerY, \"#AAA\");\r\n\r\n    for (let i = 0; i < this.actors.length; i++) this.actors[i].render();\r\n  }\r\n\r\n  /*\r\n  //just testing\r\n  async hurdur() {\r\n    while (true) {\r\n      let ch = await this.getch();\r\n      console.log(\"hurdur: \" + ch);\r\n      if (ch === \"h\") break;\r\n    }\r\n  }\r\n  */\r\n\r\n  async update() {\r\n    while (true) {\r\n      if (this.gameStatus === this.GameStatus.STARTUP) {\r\n        this.player.computeFov();\r\n        this.render();\r\n      }\r\n      this.gameStatus = this.GameStatus.IDLE;\r\n\r\n      const ch = await this.getch();\r\n      //console.log(\"ch \" + ch);\r\n\r\n      let dx = 0;\r\n      let dy = 0;\r\n\r\n      if (ch === \"ArrowLeft\") dx--;\r\n      if (ch === \"ArrowRight\") dx++;\r\n      if (ch === \"ArrowUp\") dy--;\r\n      if (ch === \"ArrowDown\") dy++;\r\n\r\n      if (dx !== 0 || dy !== 0) {\r\n        this.gameStatus = this.GameStatus.NEW_TURN;\r\n\r\n        if (this.player.moveOrAttack(this.player.x + dx, this.player.y + dy)) {\r\n          this.player.computeFov();\r\n        }\r\n\r\n        if (this.gameStatus === this.GameStatus.NEW_TURN) {\r\n          for (let i = 0; i < this.actors.length; i++) {\r\n            const actor = this.actors[i];\r\n            if (actor !== this.player) {\r\n              actor.update();\r\n            }\r\n          }\r\n        }\r\n\r\n        /*\r\n        if (this.map.canWalk(this.player.x + dx, this.player.y + dy)) {\r\n          this.player.x += dx;\r\n          this.player.y += dy;\r\n        }\r\n        */\r\n      }\r\n\r\n      //finally draw screen\r\n      this.render();\r\n    }\r\n  }\r\n}\r\n\r\nconst game = new Game();\r\ngame.run();\r\n\n\n//# sourceURL=webpack:///./src/index.js?");

/***/ }),

/***/ "./src/map.js":
/*!********************!*\
  !*** ./src/map.js ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Map)\n/* harmony export */ });\n/* harmony import */ var ___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! . */ \"./src/index.js\");\n/* harmony import */ var _actor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./actor */ \"./src/actor.js\");\n/* harmony import */ var _bsp_generator__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./bsp_generator */ \"./src/bsp_generator.js\");\n/* harmony import */ var _random__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./random */ \"./src/random.js\");\n\r\n\r\n\r\n\r\n\r\n\r\n\r\nconst random = new _random__WEBPACK_IMPORTED_MODULE_3__[\"default\"]();\r\n\r\nclass Tile {\r\n  constructor() {\r\n    this.canWalk = false;\r\n    this.explored = false;\r\n  }\r\n}\r\n\r\nclass Map {\r\n  constructor(width, height) {\r\n    this.width = width;\r\n    this.height = height;\r\n\r\n    this.startX = 0;\r\n    this.startY = 0;\r\n\r\n    this.constants = Object.freeze({\r\n      ROOM_MAX_SIZE: 10,\r\n      ROOM_MIN_SIZE: 4,\r\n      MAX_ROOM_MONSTERS: 3,\r\n    });\r\n\r\n    this.root = null;\r\n  }\r\n\r\n  isWall(x, y) {\r\n    const index = x + y * this.width;\r\n    return !this.tiles[index].canWalk;\r\n  }\r\n\r\n  setWall(x, y) {\r\n    this.tiles[x + y * this.width].canWalk = false;\r\n  }\r\n\r\n  canWalk(x, y) {\r\n    if (this.isWall(x, y)) return false;\r\n\r\n    for (let i = 0; i < ___WEBPACK_IMPORTED_MODULE_0__.game.actors.length; i++) {\r\n      const actor = ___WEBPACK_IMPORTED_MODULE_0__.game.actors[i];\r\n\r\n      if (actor.x === x && actor.y === y && actor !== ___WEBPACK_IMPORTED_MODULE_0__.game.player) {\r\n        return false;\r\n      }\r\n    }\r\n\r\n    return true;\r\n  }\r\n\r\n  addMonster(x, y) {\r\n    const rng = random.getInt(0, 100);\r\n\r\n    if (rng < 80) {\r\n      ___WEBPACK_IMPORTED_MODULE_0__.game.actors.push(new _actor__WEBPACK_IMPORTED_MODULE_1__[\"default\"](x, y, 'o', \"orc\", \"#00AA00\"));\r\n    } else {\r\n      ___WEBPACK_IMPORTED_MODULE_0__.game.actors.push(new _actor__WEBPACK_IMPORTED_MODULE_1__[\"default\"](x, y, 't', \"troll\", \"#008800\"));\r\n    }\r\n  }\r\n\r\n  dig(x1, y1, x2, y2) {\r\n    x1 = x1 | 0;\r\n    x2 = x2 | 0;\r\n    y1 = y1 | 0;\r\n    y2 = y2 | 0;\r\n\r\n    if (x2 < x1) {\r\n      const tmp = x2;\r\n      x2 = x1;\r\n      x1 = tmp;\r\n    }\r\n\r\n    if (y2 < y1) {\r\n      const tmp = y2;\r\n      y2 = y1;\r\n      y1 = tmp;\r\n    }\r\n\r\n    for (let tilex = x1; tilex <= x2; tilex++) {\r\n      for (let tiley = y1; tiley <= y2; tiley++) {\r\n        const index = tilex + tiley * this.width;\r\n        this.tiles[index].canWalk = true;\r\n      }\r\n    }\r\n  }\r\n\r\n  createRoom(firstRoom, x1, y1, x2, y2) {\r\n    this.dig(x1, y1, x2, y2);\r\n\r\n    //if first room, dont add any monsters \r\n    if (firstRoom)\r\n      return;\r\n\r\n    let numberOfMonsters = random.getInt(0, this.constants.MAX_ROOM_MONSTERS);\r\n\r\n    while(numberOfMonsters > 0)\r\n    {\r\n      const x = random.getInt(x1, x2);\r\n      const y = random.getInt(y1, y2);\r\n      if (this.canWalk(x, y))\r\n      {\r\n        this.addMonster(x, y);\r\n      }\r\n      numberOfMonsters--;\r\n    }\r\n\r\n    this.addMonster((x1 + x2) / 2, (y1 + y2) / 2);\r\n    \r\n  }\r\n\r\n  generate(seed) {\r\n    random.setSeed(seed);\r\n    console.log(\"seed: \" + seed);\r\n    this.root = new _bsp_generator__WEBPACK_IMPORTED_MODULE_2__[\"default\"](0, 0, this.width, this.height, 5);\r\n    this.tiles = new Array(this.width * this.height).fill(false);\r\n\r\n    //const option = random.getInt(0, 2);\r\n    //console.log(\"option: \" + option);\r\n    const option = 1;\r\n    \r\n\r\n    for (let i = 0; i < this.width * this.height; i++) {\r\n      this.tiles[i] = new Tile();\r\n\r\n      //we can use path/room data directly from bsp if we want.\r\n      if (option === 0) this.tiles[i].canWalk = !this.root.map[i];\r\n    }\r\n\r\n    //lets create every room one by one\r\n    let lastx = 0;\r\n    let lasty = 0;\r\n    let x = 0;\r\n    let y = 0;\r\n    let w = 0;\r\n    let h = 0;\r\n    for (let i = 0; i < this.root.rooms.length; i++) {\r\n      const room = this.root.rooms[i];\r\n      const firstRoom = i > 0 ? false: true;\r\n\r\n      if (i === 0) {\r\n        this.startX = (room.x + room.w / 2) | 0;\r\n        this.startY = (room.y + room.h / 2) | 0;\r\n      }\r\n\r\n      //option 1\r\n      if (option === 1) {\r\n        w = room.w;\r\n        h = room.h;\r\n        x = room.x + 1;\r\n        y = room.y + 1;\r\n\r\n        \r\n        this.createRoom(firstRoom, x, y, x + w - 2, y + h - 2);\r\n      }\r\n\r\n      //option 2\r\n      if (option === 2) {\r\n        w = random.getInt(this.constants.ROOM_MIN_SIZE, room.w - 2);\r\n        h = random.getInt(this.constants.ROOM_MIN_SIZE, room.h - 2);\r\n        x = random.getInt(room.x, room.x + room.w - w - 0) + 1;\r\n        y = random.getInt(room.y, room.y + room.h - h - 0) + 1;\r\n\r\n        \r\n        this.createRoom(firstRoom, x, y, x + w - 2, y + h - 2);\r\n      }\r\n\r\n      if (option === 1 || option === 2) {\r\n        if (i > 0) {\r\n          this.dig(lastx, lasty, x + w / 2, lasty);\r\n          this.dig(x + w / 2, lasty, x + w / 2, y + h / 2);\r\n        }\r\n        lastx = x + w / 2;\r\n        lasty = y + h / 2;\r\n      }\r\n    }\r\n  }\r\n\r\n  render() {\r\n    const darkWall = \"#\";\r\n    const darkGround = \".\";\r\n\r\n    for (let y = 0; y < this.height; y++) {\r\n      for (let x = 0; x < this.width; x++) {\r\n        const fovValue = ___WEBPACK_IMPORTED_MODULE_0__.game.player.fov.getMapped(x, y);\r\n        if (fovValue === 2 || fovValue === 1) {\r\n          if (fovValue === 2) {\r\n            ___WEBPACK_IMPORTED_MODULE_0__.game.drawChar(\r\n              this.isWall(x, y) ? darkWall : darkGround,\r\n              x,\r\n              y,\r\n              \"#AAA\"\r\n            );\r\n          } else {\r\n            ___WEBPACK_IMPORTED_MODULE_0__.game.drawChar(\r\n              this.isWall(x, y) ? darkWall : darkGround,\r\n              x,\r\n              y,\r\n              \"#444\"\r\n            );\r\n          }\r\n        } else {\r\n        }\r\n      }\r\n    }\r\n  }\r\n}\r\n\n\n//# sourceURL=webpack:///./src/map.js?");

/***/ }),

/***/ "./src/random.js":
/*!***********************!*\
  !*** ./src/random.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\nlet _seed = 0;\r\n\r\nclass Randomizer {\r\n  constructor() {\r\n    this.seed = 0;\r\n    this.rnd = 0;\r\n  }\r\n\r\n  setSeed(seed) {\r\n    _seed = seed;\r\n  }\r\n\r\n  calc() {\r\n    _seed = (_seed * 9301 + 49297) % 233280;\r\n    this.rnd = _seed / 233280.0;\r\n  }\r\n\r\n  getInt(min, max) {\r\n    max = max || 1;\r\n    min = min || 0;\r\n    this.calc();\r\n    return Math.floor(min + this.rnd * (max - min));\r\n  }\r\n\r\n  dice(dices, eyes, bonus = 0) {\r\n    let v = 0;\r\n    eyes++;\r\n    for (let i = 0; i < dices; i++) {\r\n      v += Number(this.getInt(1, eyes));\r\n    }\r\n    v += +bonus;\r\n    if (v < dices) v = dices;\r\n    return v;\r\n  }\r\n}\r\n\r\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Randomizer);\r\n\n\n//# sourceURL=webpack:///./src/random.js?");

/***/ }),

/***/ "./src/rectangle.js":
/*!**************************!*\
  !*** ./src/rectangle.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n\r\n\r\nclass Rectangle {\r\n  constructor(x, y, w, h) {\r\n    this.x = x;\r\n    this.y = y;\r\n    this.w = w;\r\n    this.h = h;\r\n  }\r\n\r\n  GetHalfDimensionX() {\r\n    return this.w / 2;\r\n  }\r\n  GetHalfDimensionY() {\r\n    return this.h / 2;\r\n  }\r\n\r\n  GetCenterX() {\r\n    return this.x + this.GetHalfDimensionX();\r\n  }\r\n\r\n  GetCenterY() {\r\n    return this.y + this.GetHalfDimensionY();\r\n  }\r\n}\r\n\r\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Rectangle);\r\n\n\n//# sourceURL=webpack:///./src/rectangle.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.js");
/******/ 	
/******/ })()
;