# Slan Roguelike

Game can be found [here](https://nomikki.github.io/slanRl/).

If you want to play specific seed, add the following URL parameter, e.g. [?seed=29591285](https://nomikki.github.io/slanRl/?seed=29591285)

## How to run Tests

### Basic tests

#### Eslint

```bash
yarn lint
```

#### TypeScript Compiler noEmit

```bash
yarn verify
```

### End-to-end tests

E2E tests save snapshots and videos under [`test-results/`](./test-results/).

#### Headless Chrome + Firefox e2e tests with all resolutions

```bash
yarn test:e2e
```

#### Headed Chrome e2e tests with one resolutions and default delay

```bash
yarn test:e2e-debug
```

#### Headed Chrome e2e tests with one resolutions and 500ms delay

```bash
cross-env SLOWMO=500 yarn test:e2e-debug
```

#### Headed Firefox e2e tests with one resolutions and 150ms delay

```bash
cross-env BROWSER=firefox SLOWMO=150 yarn test:e2e-debug
```
