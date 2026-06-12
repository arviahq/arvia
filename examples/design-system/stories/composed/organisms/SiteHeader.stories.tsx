import type { Meta, StoryObj } from "@storybook/react";
import { DemoSiteHeader } from "../../../src/storybook/renderers";

const meta: Meta<typeof DemoSiteHeader> = {
  title: "Organisms/SiteHeader",
  component: DemoSiteHeader,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof DemoSiteHeader>;

export const Default: Story = {};
