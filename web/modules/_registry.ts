/**
 * Module registration barrel.
 *
 * Each import triggers a side-effect that calls moduleRegistry.register().
 * Import this file once in both the server layout and the client provider tree
 * so every JS context has a fully-populated registry before rendering begins.
 *
 * To add a new module: `import "./my-module";`
 * No other Core file needs to change.
 */
import "./rrhh";
import "./compras";
import "./contabilidad";
import "./mantenimiento";
import "./sso";
import "./ime";
import "./pme";
