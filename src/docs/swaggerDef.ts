import config from "config";

import { name, version, repository } from "../../package.json";

const swaggerDef = {
  openapi: "3.0.0",
  info: {
    title: `${name} API documentation`,
    version,
    license: {
      name: "MIT",
      url: repository,
    },
  },
  servers: [
    {
      url: `http://localhost:${config.PORT}/`,
    },
  ],
};

export default swaggerDef;
