import { unstable_vitePlugin as remix } from "@remix-run/dev";
import { remixDevTools } from "remix-development-tools/vite";
import { flatRoutes } from "remix-flat-routes";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default ({ mode }: { mode: string }) => {
  const env = loadEnv(mode, process.cwd(), "");
  process.env = { ...process.env, ...env };
  return defineConfig({
    define: {
      global: {}
    },
    plugins: [
      remixDevTools(),
      remix({
        ignoredRouteFiles: ["**/.*"],
        routes: async (defineRoutes) => {
          return flatRoutes("routes", defineRoutes);
        }
      }),
      tsconfigPaths()
    ],
    server: {
      port: 3000
    }
  });
};
