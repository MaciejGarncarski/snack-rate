import addonChromatic from "@chromatic-com/storybook";
import addonA11y from "@storybook/addon-a11y";
import addonDocs from "@storybook/addon-docs";
import addonTheme, { withThemeByClassName } from "@storybook/addon-themes";
import addonVitest from "@storybook/addon-vitest";
import { definePreview } from "@storybook/tanstack-react";

// oxlint-disable-next-line import/no-unassigned-import
import "#/styles/app.css";

export default definePreview({
  addons: [addonA11y(), addonDocs(), addonVitest(), addonChromatic(), addonTheme()],
  tags: ["autodocs"],
  decorators: [
    withThemeByClassName({
      themes: {
        light: "light",
        dark: "dark",
      },
      defaultTheme: "dark",
      parentSelector: "html",
    }),
  ],
  parameters: {
    layout: "centered",
    controls: {
      matchers: {
        color: /(background|color)$/iu,
        date: /Date$/iu,
      },
    },
  },
});
